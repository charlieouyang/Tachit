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
    "message": "Links found!",
    "links_found": "2",
    "link_url": "1610131002312",
    "result": [
        {
            "presignedGetURL": "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/a9f26e0a129d4407d8a393a82b066d05.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1428085648&Signature=W%2Fl%2B476KQDFK0MHtRJz7kGDo07U%3D",
            "name": "Amazon delivery south park 1",
            "description": "hello there mr ups man amazon 1",
            "media_type": "picture",
            "user_name": "charlieouyang"
        },
        {
            "presignedGetURL": "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/444e645aeb82959ff51f09ba0e0118bb.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1428085648&Signature=W1C36hIkLBwiBeiYvHWQoIlcLXk%3D",
            "name": "Amazon delivery south park 2",
            "description": "hello there mr ups man amazon 2",
            "media_type": "picture",
            "user_name": "charlieouyang"
        }
    ]
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
    "link_url": "6101100312",
    "data": [
        {
            "name": "Amazon delivery south park 1",
            "description": "hello there mr ups man amazon 1",
            "media_type": "picture",
            "user_name": "charlieouyang"
        },
        {
            "name": "Amazon delivery south park 2",
            "description": "hello there mr ups man amazon 2",
            "media_type": "picture",
            "user_name": "charlieouyang"
        }
    ]
}
```

**Response** 

Link post success response: 
```
{
    "link_url": "6101100312",
    "result": [
        {
            "presignedUploadURL": "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/a9f26e0a129d4407d8a393a82b066d05.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1428087019&Signature=xpgEQO4xCXbv27m0V5bEQh1m%2BAY%3D",
            "name": "Amazon delivery south park 1",
            "description": "hello there mr ups man amazon 1",
            "media_type": "picture",
            "user_name": "charlieouyang"
        },
        {
            "presignedUploadURL": "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/444e645aeb82959ff51f09ba0e0118bb.png?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1428087019&Signature=VThY%2BTt%2FKRnHxDJAMi5hAqndK4w%3D",
            "name": "Amazon delivery south park 2",
            "description": "hello there mr ups man amazon 2",
            "media_type": "picture",
            "user_name": "charlieouyang"
        }
    ]
}
```

Link exists already (HTTP Error Code 409) response

```
{
    "result": [
        {
            "id": 22,
            "link_url": "6101100322312",
            "amazon_key": "charlieouyang/a9f26e0a129d4407d8a393a82b066d05.png",
            "name": "Amazon delivery south park 1",
            "description": "hello there mr ups man amazon 1",
            "media_type": "picture",
            "user_name": "charlieouyang",
            "createdAt": "2015-04-03T18:35:19.000Z",
            "updatedAt": "2015-04-03T18:35:19.000Z"
        },
        {
            "id": 23,
            "link_url": "6101100322312",
            "amazon_key": "charlieouyang/444e645aeb82959ff51f09ba0e0118bb.png",
            "name": "Amazon delivery south park 2",
            "description": "hello there mr ups man amazon 2",
            "media_type": "picture",
            "user_name": "charlieouyang",
            "createdAt": "2015-04-03T18:35:19.000Z",
            "updatedAt": "2015-04-03T18:35:19.000Z"
        }
    ],
    "message": "Link already exists",
    "links_found": 2
}
```

###Get Placement Clicks

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
        id: 7
        click_placement: "IOS_App_Link"
        createdAt: "2015-03-23T21:06:39.000Z"
        updatedAt: "2015-03-23T21:06:39.000Z"
    },
    {
        id: 8
        click_placement: "IOS_App_Link"
        createdAt: "2015-03-23T21:07:02.000Z"
        updatedAt: "2015-03-23T21:07:02.000Z"
    }],
    message: "Clicks found!",
    clicks_found: 2
}
```


###Post Click to API (Register User Clicks)

**URL** - tachitnow.com/api/click

**Request Type** - POST

**Request Payload** - content type must be ```application/json```

```
{
    "click_placement": "IOS_App_Link"
}
```

**Response** 

Click post success response: 

```
{
    click_placement: "IOS_App_Link",
    message: "Click recorded!"
}
```


###Post Email to API

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
