/*
Preview POST
Mobile app POST link with thumbnails of pictures
    - POST will have content type form/multipart
        - files
        - fields -> NOT JSON
    - Check in Links DB to see if it exists
        - If it does exist, check for finalize
            - If it's not final, then upload and update existing DB entry
            - If it's final, then return "already finalized"
        - If it does not exist, create new DB entry and finalize = false
    - API will store these pictures in /uploads directory
    - API will return with OK result with FINAL = false
    - API will wait for FINAL call
    - When APP hits link, API will check DB to see if it's FINAL or not

Finalize POST
API will wait for FINALIZE call
    - API will check links to check for FINALIZE property
        - If FINALIZE is false, then we can finalize and find the link with /uploads and POST to S3
            - Input will be actual files (no thumbnails)
            1) save the files to the ./staging/ directory
            2) retrieve Links that correspond to the link_url
            3) read the files and thumbnails from ./staging/ and ./uploads/
            4) using S3 API, post the files and thumbnails to S3
            5) store the file names and keys to the DB (AKA update and create same entries except real)
            6) return sucess
        - If FINALIZE is true, return with link already set

Add user middle layer to support user sessions and S3 user buckets
*/

module.exports = function (router) {
    'use strict';

    var db = require('../models'),
        crypto = require('crypto'),
        AWS = require('aws-sdk'),
        async = require('async'),
        fs = require('fs'),
        Busboy = require('busboy'),
        zlib = require('zlib'),
        s3 = require('s3'),
        Link = db.Link,
        availableFields = {
            'link_url': 'link_url',
            'amazon_url': 'amazon_url',
            'name': 'name',
            'description': 'description',
            'media_type': 'media_type',
            'created_at': 'created_at',
            'user_id': 'user_id'
        },
        s3Config = require('../config/config.json')["default"].s3,
        mediaTypes = require('../config/config.json')["default"].media_types,
        uploadDirectoryName = require('../config/config.json')["default"]["storage"].uploadDirectoryName,
        hostName = require('../config/config.json')["default"].hostName,
        winston = require('winston');

    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({ filename: 'link.log' })
        ]
    });

    try {
        var prodHostName = require('../config/configProd.json')["production"].hostName;
        if (prodHostName) {
            hostName = prodHostName;
        }
    } catch (e) {
        console.log(e);
    }

    AWS.config = {
        "accessKeyId": s3Config.accessKeyId, 
        "secretAccessKey": s3Config.secret, 
        "region": s3Config.region
    };

    router.get('/link', function(req, res) {
        var dict = {};

        dict.message ='Welcome to the Links API!! Only ballers come here!';

        res.statusCode = 200;
        res.json(dict);
    });

    router.get('/link/:link_url', function(req, res) {
        Link.findAll({
            where: {link_url: req.params.link_url}
        }).then(function(links) {
            var dict = {},
                calls = [],
                s3Instance,
                params,
                finalState = false;

            logger.log('info', 'Calling /link/ ' + req.params.link_url + '');
            if (links.length < 1) {
                dict.message ='No links found';
                dict.links_found = links.length;
                res.statusCode = 200;
                res.json(dict);
            } else {
                //Will need to implement GET S3 presigned URL later
                //But first, just return what you get from DB assuming that final===false
                links.forEach(function(link){
                    if (link.get("final") === "true") {
                        finalState = true;
                    }
                });

                console.log("Links found with final: " + finalState);
                console.log("links[0] data %j", links[0].toJSON());

                //If the link is finalized, generate presigned GET URLS from S3
                //else the link isn't finalized, then send GET links from public /uploads folder
                if (finalState) {
                    logger.log('info', 'Link is final... generating S3 presigned URLs');
                    s3Instance = new AWS.S3();

                    links.forEach(function(link) {
                        //preview file
                        calls.push(function(callback) {
                            params = {Bucket: s3Config.bucket, Key: link.dataValues.amazon_key_preview};
                            s3Instance.getSignedUrl('getObject', params, function (err, url) {
                                if (err) {
                                    return callback(err);
                                }
                                console.log("preview GET URL received: " + url);
                                callback(null, {
                                    "id": link.dataValues.id,
                                    "presignedGetURL": url,
                                    "name": link.dataValues.name,
                                    "description": link.dataValues.description,
                                    "media_type": link.dataValues.media_type,
                                    "user_name": link.dataValues.user_name,
                                    "created_at": link.dataValues.createdAt,
                                    "final": link.dataValues.final,
                                    "type": "preview",
                                    "link_url": link.dataValues.link_url
                                });
                            });
                        });

                        //Actual file
                        calls.push(function(callback) {
                            params = {Bucket: s3Config.bucket, Key: link.dataValues.amazon_key_actual};
                            s3Instance.getSignedUrl('getObject', params, function (err, url) {
                                if (err) {
                                    return callback(err);
                                }
                                console.log("actual GET URL received: " + url);
                                callback(null, {
                                    "id": link.dataValues.id,
                                    "presignedGetURL": url,
                                    "name": link.dataValues.name,
                                    "description": link.dataValues.description,
                                    "media_type": link.dataValues.media_type,
                                    "user_name": link.dataValues.user_name,
                                    "created_at": link.dataValues.createdAt,
                                    "final": link.dataValues.final,
                                    "type": "actual",
                                    "link_url": link.dataValues.link_url
                                });
                            });
                        });
                    });
    
                    console.log("Making the parallel calls length: " + calls.length);
                    async.parallel(calls, function(err, result) {
                        var temp = {},
                            resultArray = [];

                        console.log("results came back... ");

                        if (err) {
                            res.statusCode = 500;
                            res.json(err);
                        }

                        console.log("going through results");

                        result.forEach(function(res){
                            if (temp[res.id]) {
                                if (res.type === "actual") {
                                    temp[res.id].actual_presigned_url = res.presignedGetURL;
                                } else {
                                    temp[res.id].preview_presigned_url = res.presignedGetURL;
                                }
                                temp[res.id].type = undefined;
                                resultArray.push(temp[res.id]);
                            } else {
                                temp[res.id] = res;
                                if (res.type === "actual") {
                                    temp[res.id].actual_presigned_url = res.presignedGetURL;
                                } else {
                                    temp[res.id].preview_presigned_url = res.presignedGetURL;
                                }
                                temp[res.id].presignedGetURL = undefined;
                            }
                        });
                        
                        logger.log('info', 'Finished generating S3 presigned URLs and returning');

                        res.statusCode = 200;
                        res.json({
                            "message": "Links found!",
                            "links_found": resultArray.length,
                            "link_url": req.params.link_url,
                            "result": resultArray
                        });
                    });

                } else {
                    links.forEach(function(link){
                        link.setDataValue("temp_link", hostName + "api/" + uploadDirectoryName + "/" + encodeURIComponent(link.getDataValue("uniquefilename")));
                    });

                    logger.log('info', 'Link is not final... generating temp local URLs');

                    res.statusCode = 200;
                    res.json({
                        result: links,
                        message: "Links found!"
                    });
                }

            }
        }).catch(function(error) {
            var dict = {};
            res.statusCode = 500;

            dict.message = 'Get Links failed';
            dict.error = error;
            res.json(dict);
        });
    });
    
    //************** preview POST *********************************************//
    /*
    The input parameters must be of type multipart/form-data to support file upload
    Sample input data is
    Raw

    --ARCFormBoundaryrpsve65sx0kvs4i
    Content-Disposition: form-data; name="data"

    %7B%22link_url%22%3A%226101100312%22%2C%22data%22%3A%5B%7B%22name%22%3A%22Amazondeliverysouthpark1%22%2C%22description%22%3A%22hellotheremrupsmanamazon1%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22kevinouyang%22%2C%22final%22%3A%22false%22%2C%22fieldfilename%22%3A%221%22%7D%2C%7B%22name%22%3A%22Amazondeliverysouthpark2%22%2C%22description%22%3A%22hellotheremrupsmanamazon2%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22kevinouyang%22%2C%22final%22%3A%22false%22%2C%22fieldfilename%22%3A%222%22%7D%5D%7D
    --ARCFormBoundaryrpsve65sx0kvs4i--

    and parsed looks like this

    data

    {"link_url":"6101100312","data":[{"name":"Amazondeliverysouthpark1","description":"hellotheremrupsmanamazon1","media_type":"picture","user_name":"kevinouyang","final":"false","fieldfilename":"1"},{"name":"Amazondeliverysouthpark2","description":"hellotheremrupsmanamazon2","media_type":"picture","user_name":"kevinouyang","final":"false","fieldfilename":"2"}]}

    File data:
    fieldname in the file upload is very important as it's used to match the details in the POST field data...
    */

    // Basic workflow:
    // 1) Store all files uploaded in the ./uploads/ directory with timestamped file names and stored in local array
    // 2) Find the links from DB that match the link_url 
    //     - If the stored links finalize is true, then return
    //     - Else destroy all of the links that match the link_url and create new ones
    // 3) The newly created links will store the file information along with finalize = false
    // 4) Return the newly POSTed preview links

    //*************************************************************************//
    router.post('/preview', function(req, res) {
        var busboy = new Busboy({ headers: req.headers }),
            saveTo,
            data,
            acceptedField = {
                'name': 'name',
                'description': 'description',
                'media_type': 'media_type',
                'user_name': 'user_name',
                'final': 'final',
                'fieldfilename': 'fieldfilename'
            },
            validResults = [],
            valid = {},
            s3Instance,
            params,
            presignedUrl,
            tempFileName,
            tempFile,
            fileStreams = [];

        //logger.log('info', 'Hit Preview URL!!!');

        //Store the uploaded files into /upload directory
        //file name will correspond username/[timestamp]
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            //logger.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
                //logger.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function() {
                console.log('File [' + fieldname + '] Finished');
                //file.resume();
                //logger.log('File [' + fieldname + '] Finished');
            });

            tempFileName = Date.now() + '-preview-' + filename;
            fileStreams.push({ 
                fileName: filename, 
                fieldName: fieldname,
                uniqueName: tempFileName
            });
            //console.log("Writing file... ");
            //logger.log('info', 'Writing file...');
            file.pipe(fs.createWriteStream("./" + uploadDirectoryName + "/" + tempFileName));
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            //This here will expect the fieldname of 'data' and val should be the JSON string
            console.log("in the field event handler -> " + fieldname);

            if (fieldname === "data") {
                data = JSON.parse(decodeURIComponent(val));
            }

            //logger.log('info', 'Got field event handler');
        });
        busboy.on('finish', function() {
            console.log('Finished all uploading!');
            //logger.log('Finished all uploading!');

            //logger.log('uploading and data parsing complete... DB access time!');
            if (data) {
                for (var index = 0; index < data.data.length; index++) {
                    for (var key in acceptedField) {
                        if (acceptedField.hasOwnProperty(key)) {
                            var dataKey = acceptedField[key];
                            valid[key] = data.data[index][dataKey];
                        }
                    }
                    valid.link_url = data.link_url;
                    validResults.push(valid);
                    valid = {};
                }

                Link.findAll({
                    where: {
                        link_url: data.link_url
                    }
                }).then(function(links) {
                    var dict = {},
                        date = new Date(),
                        fileName,
                        concatenatedFileName,
                        currentFinal = false;

                    logger.log('DB access complete... going through links!');
                    for (var index = 0; index < validResults.length; index++) {
                        for (var i = 0; i < fileStreams.length; i++) {
                            if (fileStreams[i].fieldName === validResults[index].fieldfilename) {
                                validResults[index].uniquefilename = fileStreams[i].uniqueName;
                                validResults[index].final = "false";
                            }
                        }
                    }

                    //DB read done... Going to delete those entries, then create new ones
                    links.forEach(function (storedLink){
                        if (storedLink.get("final") === "true") {
                            currentFinal = true;
                        }
                    });

                    if (!currentFinal) {
                        logger.log('Links not final, so doing DB deletes and then create!');
                        //delete all the rows that had the same link_url, then create brand new ones
                        Link.destroy({
                            where: {
                              link_url: data.link_url
                            }
                        }).then(function(){
                            Link.bulkCreate(validResults).then(function(links) {
                                logger.log('DB delete and create compelete. Returning!');
                                res.statusCode = 200;
                                res.json({
                                    result: links,
                                    message: "Updated previous links with new data"
                                });
                            });
                        });
                    } else {
                        logger.log('Links are final already... Return!');
                        dict.result = links;
                        dict.message ="Link has already been finalized!";
                        dict.links_found = links.length;
                        res.statusCode = 409;
                        res.json(dict);
                    }
                });
            }
        });
        req.pipe(busboy);
    });
    
    //************** finalize POST *********************************************//
    /*
    IMPORTANT: The fieldname must match between file in /preview and in /finalize
        - Ex) if preview file: (fieldname: 1, filename: preview1.png)  -- Uploaded in /preview endpoint
              then actual file: (filedname: 1, filename: actual1.png)  -- Uploaded in /finalize endpoint

    This assumes that the number of 'links' that are in the finalize POST is the same 
    as the number of 'links' in the preview POST

    Upload files in this POST will be 
        - Actual picture, video, audio files (Can Eddy upload only clips? Like thumbnails)
    
    Picture, maybe video, maybe audio
        - Uploaded file here will be actual image
        - Endpoint must go retrieve the thumbnail that corresponds to this
        - Field file name will match with preview files field file name

    */

    // Basic workflow:
    // 1) Store all files uploaded in the ./uploads/ which are actual files 
    //      directory with timestamped file names and stored in local array
    // 2) Find the links from DB that match the link_url 
    //     - If the stored links finalize is true, then return error that it is already finalized
    //     - Modify the existing entries by updating the Links and adding the uniqueactualfilename column
    // 3) The newly created links will store the file information along with finalize = true
    // 4) Upload the files to S3
    // 5) Return the newly POSTed preview links as success

    //*************************************************************************//

    router.post('/finalize', function(req, res) {
        var busboy = new Busboy({ headers: req.headers }),
            saveTo,
            data,
            acceptedField = {
                'name': 'name',
                'description': 'description',
                'media_type': 'media_type',
                'user_name': 'user_name',
                'final': 'final',
                'fieldfilename': 'fieldfilename'
            },
            validResults = [],
            valid = {},
            s3Instance,
            params,
            presignedUrl,
            tempFileName,
            tempFile,
            actualFilesInfo = [];

        //Store the uploaded files into /upload directory
        //file name will correspond username/[timestamp]
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            tempFileName = Date.now() + '-actual-' + filename;
            actualFilesInfo.push({ 
                fileName: filename, 
                fieldName: fieldname,
                uniqueName: tempFileName
            });
            console.log("Writing file... ");
            file.pipe(fs.createWriteStream("./" + uploadDirectoryName + "/" + tempFileName));
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            //This here will expect the fieldname of 'data' and val should be the JSON string
            console.log("in the field event handler -> " + fieldname);

            if (fieldname === "data") {
                data = JSON.parse(decodeURIComponent(val));
            }
        });
        busboy.on('finish', function() {
            console.log('Finished all uploading!');

            if (data) {
                for (var index = 0; index < data.data.length; index++) {
                    for (var key in acceptedField) {
                        if (acceptedField.hasOwnProperty(key)) {
                            var dataKey = acceptedField[key];
                            valid[key] = data.data[index][dataKey];
                        }
                    }
                    valid.link_url = data.link_url;
                    validResults.push(valid);
                    valid = {};
                }

                Link.findAll({
                    where: {
                        link_url: data.link_url
                    }
                }).then(function(links) {
                    var dict = {},
                        date = new Date(),
                        fileName,
                        concatenatedFileName,
                        currentFinal = false,
                        linksData = [],
                        tempObj,
                        j = 0;

                    if (links.length === 0) {
                        dict.message ="No links found. Please call preview endpoint first";
                        dict.links_found = links.length;
                        res.statusCode = 200;
                        res.json(dict);
                    }

                    for (var index = 0; index < validResults.length; index++) {
                        for (var i = 0; i < actualFilesInfo.length; i++) {
                            if (actualFilesInfo[i].fieldName === validResults[index].fieldfilename) {
                                validResults[index].uniquefilename = actualFilesInfo[i].uniqueName;
                            }
                        }
                    }

                    //DB read done... Going to delete those entries, then create new ones
                    links.forEach(function (storedLink){
                        if (storedLink.get("final") === "true") {
                            currentFinal = true;
                        }
                        tempObj = storedLink.toJSON();
                        tempObj.uniqueactualfilename = validResults[j].uniquefilename;
                        tempObj.amazon_key_preview = validResults[j].user_name + "/" + storedLink.uniquefilename;
                        tempObj.amazon_key_actual = validResults[j].user_name + "/" + tempObj.uniqueactualfilename;
                        tempObj.final = "true";
                        linksData.push(tempObj);
                        j++;
                    });

                    if (!currentFinal) {
                        //Do update on the links objects retrieved with the stored actual files
                        //Then upload all of the files onto S3

                        async.each(linksData, function(linkData, callback){
                            //Do all DB updates here
                            Link.update({ 
                                uniqueactualfilename: linkData.uniqueactualfilename,
                                amazon_key_preview: linkData.amazon_key_preview,
                                amazon_key_actual: linkData.amazon_key_actual,
                                final: "true"               //CHANGE FINALIZE TO TRUE AFTER DONE
                            }, {
                                where: {
                                    link_url: linkData.link_url,
                                    fieldfilename: linkData.fieldfilename
                                }
                            }).then(function(updatedLink){
                                console.log("Finished updating: " + updatedLink);
                                callback();
                            });
                        }, function(err){
                            //Do S3 Upload after all DB updates are done
                            console.log("Should be uploading to S3 now!");

                            var calls = [],
                                fileBody,
                                s3Instance,
                                body,
                                s3obj;

                            //Upload all files individually function
                            //Must done in series... 
                            function uploadFile(i) {
                                if (i < linksData.length) {
                                    console.log("Uploading file: #" + i);
                                    console.log(linksData[i].uniqueactualfilename);

                                    body = fs.createReadStream(uploadDirectoryName + "/" + linksData[i].uniqueactualfilename);
                                    s3obj = new AWS.S3({params: {Bucket: s3Config.bucket , Key: linksData[(i % linksData.length)].user_name + "/" + linksData[i].uniqueactualfilename}});
                                    s3obj.upload({
                                        Body: body
                                    }).on('httpUploadProgress', function(evt) { 
                                        console.log(evt); 
                                    }).send(function(err, data) { 
                                        uploadFile(i + 1);
                                        console.log(err, data);
                                        
                                    });
                                } else if (i < (linksData.length * 2)) {
                                    console.log("Uploading file: #" + i);
                                    console.log(linksData[(i % linksData.length)].uniquefilename);

                                    body = fs.createReadStream(uploadDirectoryName + "/" + linksData[(i % linksData.length)].uniquefilename);
                                    s3obj = new AWS.S3({params: {Bucket: s3Config.bucket , Key: linksData[(i % linksData.length)].user_name + "/" + linksData[(i % linksData.length)].uniquefilename}});
                                    s3obj.upload({
                                        Body: body
                                    }).on('httpUploadProgress', function(evt) { 
                                        console.log(evt); 
                                    }).send(function(err, data) { 
                                        uploadFile(i + 1);
                                        console.log(err, data);
                                        
                                    });
                                } else {
                                    dict.result = linksData;
                                    dict.message ="Finalized!";
                                    dict.links_found = linksData.length;
                                    res.statusCode = 200;
                                    res.json(dict);
                                }
                            }

                            if (links.length > 0) {
                                console.log("Calling uploadFile function with length " + links.length);
                                console.log(links[0].get("uniquefilename"));
                                console.log(linksData);
                                uploadFile(0);
                                console.log("Uploading files now!");
                            }
                        });

                    } else {
                        dict.result = links;
                        dict.message ="Link has already been finalized!";
                        dict.links_found = links.length;
                        res.statusCode = 409;
                        res.json(dict);
                    }
                });
            }
        });
        req.pipe(busboy);
    });
};