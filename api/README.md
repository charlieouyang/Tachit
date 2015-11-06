# Tachit API

This API is build using nodeJS, and express. It utilizes sequelize to communicate with MySQL DB. it uses the aws-sdk to generate presigned URLS.

## API Endpoints

### API Status Check

**URL** - tachitnow.com/api/link

**Request Type** - GET

**Response**
```
{
    "message": "Welcome to the Links API!! Only ballers come here!"
}
```

**Explanation** - If you see the response above, that means the status of the API is OK and ready to serve requests.

### Link Check

**URL** - tachitnow.com/api/link/{link_id}

**Request Type** - GET

**Response for links at preview stage**

```
{  
    "result":[  
        {  
            "id":131,
            "link_url":"kevin321",
            "amazon_key_actual":null,
            "amazon_key_preview":null,
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"kevinouyang",
            "uniquefilename":"1446768021843-preview-Air canada 1.png",
            "uniqueactualfilename":null,
            "fieldfilename":"1",
            "final":"false",
            "createdAt":"2015-11-06T00:00:21.000Z",
            "updatedAt":"2015-11-06T00:00:21.000Z",
            "temp_link":"http://localhost:6080/uploads/1446768021843-preview-Air%20canada%201.png"
        },
        {  
            "id":132,
            "link_url":"kevin321",
            "amazon_key_actual":null,
            "amazon_key_preview":null,
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"kevinouyang",
            "uniquefilename":"1446768021844-preview-Air canada 2.png",
            "uniqueactualfilename":null,
            "fieldfilename":"2",
            "final":"false",
            "createdAt":"2015-11-06T00:00:21.000Z",
            "updatedAt":"2015-11-06T00:00:21.000Z",
            "temp_link":"http://localhost:6080/uploads/1446768021844-preview-Air%20canada%202.png"
        },
        {  
            "id":133,
            "link_url":"kevin321",
            "amazon_key_actual":null,
            "amazon_key_preview":null,
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"kevinouyang",
            "uniquefilename":"1446768021844-preview-uber1.PNG",
            "uniqueactualfilename":null,
            "fieldfilename":"3",
            "final":"false",
            "createdAt":"2015-11-06T00:00:21.000Z",
            "updatedAt":"2015-11-06T00:00:21.000Z",
            "temp_link":"http://localhost:6080/uploads/1446768021844-preview-uber1.PNG"
        }
    ],
    "message":"Updated previous links with new data"
}
```

Notice that for preview stage, no files are stored on S3 and only preview files exist, which are all stored on the API server.

**Response for links at finalized stage**

```
{  
    "message":"Links found!",
    "links_found":3,
    "link_url":"kevin123",
    "result":[  
        {  
            "id":128,
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"kevinouyang",
            "created_at":"2015-11-05T23:46:57.000Z",
            "preview_presigned_url":"https://s3.amazonaws.com/www.linkprototype.com/kevinouyang/1446767217228-preview-t-mobile%20Jan%20bill.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1446769296&Signature=uPeYjm13JqI4Kj7%2BLwOIBk3HHxs%3D",
            "actual_presigned_url":"https://s3.amazonaws.com/www.linkprototype.com/kevinouyang/1446767914141-actual-2.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1446769296&Signature=Q38eN8N9D5rMsh%2FaSe430TaOKJU%3D"
        },
        {  
            "id":129,
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"kevinouyang",
            "created_at":"2015-11-05T23:46:57.000Z",
            "preview_presigned_url":"https://s3.amazonaws.com/www.linkprototype.com/kevinouyang/1446767217230-preview-t-mobile%20Feb%20bill.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1446769296&Signature=MLDQ8KL7vvyuyNOa58Q38v8J1Do%3D",
            "actual_presigned_url":"https://s3.amazonaws.com/www.linkprototype.com/kevinouyang/1446767914154-actual-3.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1446769296&Signature=wVAiWAny01TmK2C45Cdair1Aamo%3D"
        },
        {  
            "id":130,
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"kevinouyang",
            "created_at":"2015-11-05T23:46:57.000Z",
            "preview_presigned_url":"https://s3.amazonaws.com/www.linkprototype.com/kevinouyang/1446767217231-preview-t-mobile%20Mar%20bill.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1446769296&Signature=06e8PB7HsKLSTcuLIxVkUIWXeOs%3D",
            "actual_presigned_url":"https://s3.amazonaws.com/www.linkprototype.com/kevinouyang/1446767914161-actual-4.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1446769296&Signature=p4KTeA1S%2FTLTCj8DVLWYFn0CyoQ%3D"
        }
    ]
}
```

Notice that for finalized stage, all files (preview and actual) are stored on S3. 

**Links not found response**

```
{
    "message": "No links found",
    "links_found": 0
}
```

### Preview with files

**URL** - tachitnow.com/api/preview

**Request Type** - POST

**Request Payload** - content type must be ```form/multipart```

```
--ARCFormBoundarywfgp53j3vea5rk9
Content-Disposition: form-data; name="data"

%7B%22link_url%22%3A%2261011003121%22%2C%22data%22%3A%5B%7B%22name%22%3A%22Amazondeliverysouthpark2%22%2C%22description%22%3A%22hellotheremrupsmanamazon2%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22charlieouyang%22%2C%22final%22%3A%22false%22%2C%22fieldfilename%22%3A%222%22%7D%2C%7B%22name%22%3A%22Amazondeliverysouthpark1%22%2C%22description%22%3A%22hellotheremrupsmanamazon1%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22charlieouyang%22%2C%22final%22%3A%22false%22%2C%22fieldfilename%22%3A%221%22%7D%2C%7B%22name%22%3A%22Amazondeliverysouthpark3%22%2C%22description%22%3A%22hellotheremrupsmanamazon3%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22charlieouyang%22%2C%22final%22%3A%22false%22%2C%22fieldfilename%22%3A%223%22%7D%5D%7D
--ARCFormBoundarywfgp53j3vea5rk9--
```

**Data Payload Explanation**

The data payload up there are has only parameter. Please consider the data type form/multipart. The name of the parameter is "data" and the value of the parameter is a JSON string without any spaces or line breaks. It is URL encoded. The above example decoded, parsed and spaced out look like this below:

```
{  
    "link_url":"61011003121",
    "data":[  
        {  
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "final":"false",
            "fieldfilename":"2"
        },
        {  
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "final":"false",
            "fieldfilename":"1"
        },
        {  
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "final":"false",
            "fieldfilename":"3"
        }
    ]
}
```

**File Uploads**

Fieldname in the file upload is very important as it's used to match the details in the POST field data. Each file uploaded needs to match one of the 'data' blocks in the JSON data above (above example requires 3 files. One with fieldname 1, fieldname 2, and 3rd file with fieldname 3).

**Response**

Link post success response:
```
{  
    "result":[  
        {  
            "id":null,
            "link_url":"61011003121",
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592356-preview-4.png",
            "fieldfilename":"2",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z"
        },
        {  
            "id":null,
            "link_url":"61011003121",
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592344-preview-2.png",
            "fieldfilename":"1",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z"
        },
        {  
            "id":null,
            "link_url":"61011003121",
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592359-preview-6.png",
            "fieldfilename":"3",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z"
        }
    ],
    "message":"Updated previous links with new data"
}
```

This link URL is already finalized. Meaning you can't preview more. It will have a code 409 Conflict.

```
{  
    "result":[  
        {  
            "id":119,
            "link_url":"61011003121",
            "amazon_key_actual":null,
            "amazon_key_preview":null,
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592356-preview-4.png",
            "uniqueactualfilename":null,
            "fieldfilename":"2",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z"
        },
        {  
            "id":120,
            "link_url":"61011003121",
            "amazon_key_actual":null,
            "amazon_key_preview":null,
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592344-preview-2.png",
            "uniqueactualfilename":null,
            "fieldfilename":"1",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z"
        },
        {  
            "id":121,
            "link_url":"61011003121",
            "amazon_key_actual":null,
            "amazon_key_preview":null,
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592359-preview-6.png",
            "uniqueactualfilename":null,
            "fieldfilename":"3",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z"
        }
    ],
    "message":"Link has already been finalized!",
    "links_found":3
}
```

### Finalize with files

**Notes**

IMPORTANT: The fieldname must match between file in /preview and in /finalize

```
Example

Uploaded in /preview endpoint
If preview file: (fieldname: 1, filename: preview1.png)

Uploaded in /finalize endpoint
then actual file: (filedname: 1, filename: actual1.png)
```

This assumes that the number of 'links' that are in the finalize POST is the same as the number of 'links' in the preview POST

**URL** - tachitnow.com/api/finalize

**Request Type** - POST

**Request Payload** - content type must be ```form/multipart```

```
--ARCFormBoundarywfgp53j3vea5rk9
Content-Disposition: form-data; name="data"

%7B%22link_url%22%3A%2261011003121%22%2C%22data%22%3A%5B%7B%22name%22%3A%22Amazondeliverysouthpark2%22%2C%22description%22%3A%22hellotheremrupsmanamazon2%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22charlieouyang%22%2C%22final%22%3A%22true%22%2C%22fieldfilename%22%3A%222%22%7D%2C%7B%22name%22%3A%22Amazondeliverysouthpark1%22%2C%22description%22%3A%22hellotheremrupsmanamazon1%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22charlieouyang%22%2C%22final%22%3A%22true%22%2C%22fieldfilename%22%3A%221%22%7D%2C%7B%22name%22%3A%22Amazondeliverysouthpark3%22%2C%22description%22%3A%22hellotheremrupsmanamazon3%22%2C%22media_type%22%3A%22picture%22%2C%22user_name%22%3A%22charlieouyang%22%2C%22final%22%3A%22true%22%2C%22fieldfilename%22%3A%223%22%7D%5D%7D
--ARCFormBoundarywfgp53j3vea5rk9--
```

**Data Payload Explanation**

The data payload up there are has only parameter. Please consider the data type form/multipart. The name of the parameter is "data" and the value of the parameter is a JSON string without any spaces or line breaks. It is URL encoded. The above example decoded, parsed and spaced out look like this below:

```
{  
    "link_url":"61011003121",
    "data":[  
        {  
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "final":"true",
            "fieldfilename":"2"
        },
        {  
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "final":"true",
            "fieldfilename":"1"
        },
        {  
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "final":"true",
            "fieldfilename":"3"
        }
    ]
}
```

**File Uploads**

All files uploaded here in this endpoint are full files. These will be the files that will be viewed by the user after link is finalized!
Fieldname in the file upload is very important as it's used to match the details in the POST field data. Each file uploaded needs to match one of the 'data' blocks in the JSON data above (above example requires 3 files. One with fieldname 1, fieldname 2, and 3rd file with fieldname 3).

**Response**

Link post success response:
```
{  
    "result":[  
        {  
            "id":119,
            "link_url":"61011003121",
            "amazon_key_actual":"charlieouyang/1446567764580-actual-4.png",
            "amazon_key_preview":"charlieouyang/1446566592356-preview-4.png",
            "name":"Amazondeliverysouthpark2",
            "description":"hellotheremrupsmanamazon2",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592356-preview-4.png",
            "uniqueactualfilename":"1446567764580-actual-4.png",
            "fieldfilename":"2",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z",
            "finalize":"true"
        },
        {  
            "id":120,
            "link_url":"61011003121",
            "amazon_key_actual":"charlieouyang/1446567764562-actual-2.png",
            "amazon_key_preview":"charlieouyang/1446566592344-preview-2.png",
            "name":"Amazondeliverysouthpark1",
            "description":"hellotheremrupsmanamazon1",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592344-preview-2.png",
            "uniqueactualfilename":"1446567764562-actual-2.png",
            "fieldfilename":"1",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z",
            "finalize":"true"
        },
        {  
            "id":121,
            "link_url":"61011003121",
            "amazon_key_actual":"charlieouyang/1446567764596-actual-6.png",
            "amazon_key_preview":"charlieouyang/1446566592359-preview-6.png",
            "name":"Amazondeliverysouthpark3",
            "description":"hellotheremrupsmanamazon3",
            "media_type":"picture",
            "user_name":"charlieouyang",
            "uniquefilename":"1446566592359-preview-6.png",
            "uniqueactualfilename":"1446567764596-actual-6.png",
            "fieldfilename":"3",
            "final":"false",
            "createdAt":"2015-11-03T16:03:12.000Z",
            "updatedAt":"2015-11-03T16:03:12.000Z",
            "finalize":"true"
        }
    ],
    "message":"Uploaded!",
    "links_found":3
}
```

This link URL is already finalized. Meaning you can't finalize more. It will have a code 409 Conflict.

```
Data will be the same as above... But it will have conflict error.
```

### Get Placement Clicks

**URL** - tachitnow.com/api/click/{click_placement}

Example:
```
tachitnow.com/api/click/IOS_App_Link
```

**Request Type** - GET

**Response**


```
{
    result: [
    {
        id: 7,
        click_placement: "IOS_App_Link",
        city: "New York",
        region: "New York",
        country: "US",
        zip_code: "10016",
        createdAt: "2015-03-23T21:06:39.000Z",
        updatedAt: "2015-03-23T21:06:39.000Z"
    },
    {
        id: 8,
        click_placement: "IOS_App_Link",
        city: "New York",
        region: "New York",
        country: "US",
        zip_code: "10016",
        createdAt: "2015-03-23T21:07:02.000Z",
        updatedAt: "2015-03-23T21:07:02.000Z"
    }],
    message: "Clicks found!",
    clicks_found: 2
}
```


### Post Click to API (Register User Clicks)

**URL** - tachitnow.com/api/click

**Request Type** - POST

**Request Payload** - content type must be ```application/json```

```
{
    "country": "United States",
    "region": "New York",
    "city": "New York",
    "zip_code": "10018",
    "click_placement": "home-page-load"
}
```

**Response**

Click post success response:

```
{
    "country": "United States",
    "region": "New York",
    "city": "New York",
    "zip_code": "10018",
    "click_placement": "home-page-load",
    message: "Click recorded!"
}
```


### Post Email to API

**URL** - tachitnow.com/api/email

**Request Type** - POST

**Request Payload** - content type must be ```application/json```

```
{
    "email_address": "abcde@hotmail.com"
}
```

**Response**

Email post success response:

```
{
    email_address: "abcde@hotmail.com"
    message: "Email recorded!"
}
```
