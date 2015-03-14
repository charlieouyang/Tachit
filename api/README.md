# Tachit API

This API is build using nodeJS, and express. It utilizes sequelize to communicate with MySQL DB. it uses the aws-sdk to generate presigned URLS.

## API Endpoints

###API Status Check

**URL** - tachitnow.com/api/link

**Request Type** - GET

**Response** 
```
{
    "message": "Welcome to the Links API!! Only ballers come here!"
}
```

**Explanation** - If you see the response above, that means the status of the API is OK and ready to serve requests.

###Link Check

**URL** - tachitnow.com/api/link/{link_id}

**Request Type** - GET

**Response** 

Links found response: 
```
{
    "result": [
        {
            "id": 2,
            "link_url": "al",
            "amazon_key": "charlieouyang/1426312628404-charlieouyang.mp3",
            "name": "Scarface",
            "description": "Al Pacino's words of wisdom",
            "media_type": "voice",
            "user_name": "charlieouyang",
            "createdAt": "2015-03-14T05:57:08.000Z",
            "updatedAt":"2015-03-14T05:57:08.000Z"
        }
    ],
    "message": "Found 1 link",
    "links_found": 1,
    "presignedGetURL":"https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/1426312628404-charlieouyang.mp3?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1426366647&Signature=rlAlL5b%2F7tMa44HlrdKEqnXK224%3D"
}
```

Links not found response

```
{
    "message": "No links found",
    "links_found": 0
}
```

###Post Link to API (Upload Link)

**URL** - tachitnow.com/api/link

**Request Type** - POST

**Request Payload** - content type must be ```application/json```

```
{
    "link_url": "test",
    "name": "Amazon delivery south park",
    "description": "hello there mr ups man amazon",
    "media_type": "picture",
    "user_name": "charlieouyang"
}
```

**Response** 

Link post success response: 
```
{
    link_url: "test"
    name: "Amazon delivery south park"
    description: "hello there mr ups man amazon"
    media_type: "picture"
    presignedUploadURL: "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/1426366300859-charlieouyang.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1426367200&Signature=h5HozVnpEdtW%2F3jzYFoNXeK8h2I%3D"
}
```

Link exists already (HTTP Error Code 409) response

```
{
    result: [
        {
            id: 4
            link_url: "test"
            amazon_key: "charlieouyang/1426366300859-charlieouyang.png"
            name: "Amazon delivery south park"
            description: "hello there mr ups man amazon"
            media_type: "picture"
            user_name: "charlieouyang"
            createdAt: "2015-03-14T20:51:40.000Z"
            updatedAt: "2015-03-14T20:51:40.000Z"
        }
    ]
    message: "Link already exists"
    links_found: 1
}
```
