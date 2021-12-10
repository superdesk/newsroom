Feature: News API News Feed

    Background: Initial setup
        Given "companies"
        """
        [{"name": "Test Company", "is_enabled": true}]
        """
        Given "news_api_tokens"
        """
        [{"company": "#companies._id#", "enabled": true}]
        """
        When we save API token
        Given "products"
        """
        [{
            "name": "A fishy product",
            "description": "A product for those interested in fish",
            "companies": ["#companies._id#"],
            "query": "fish",
            "product_type": "news_api"
        }]
        """

    Scenario: Filter feed by products
        Given "products"
        """
        [{
            "_id": "5e4cade4d69954b6d55ac09a",
            "name": "A fishy product",
            "description": "A product for those interested in fish",
            "companies": ["#companies._id#"],
            "query": "fish",
            "product_type": "news_api"
        }, {
            "_id": "5e4cade4d69954b6d55ac09b",
            "name": "An aardvark product",
            "description": "A product for those interested in aardvarks",
            "companies": ["#companies._id#"],
            "query": "aardvark",
            "product_type": "news_api"
        }]
        """
        Given "items"
        """
        [
            {
                "_id": "urn:test1", "body_html": "Once upon a time there was a single fish who could swim",
                "versioncreated": "2015-06-01T03:48:39.000Z"
            }, {
                "_id": "urn:test2", "body_html": "Once upon a time there was an aardvark that could not swim",
                "versioncreated": "2015-06-02T03:48:39.000Z"
            }, {
                "_id": "urn:test3", "body_html": "Once upon a time there were 2 fish who could swim",
                "versioncreated": "2015-06-02T03:48:39.000Z"
            }, {
                "_id": "urn:test4", "body_html": "Once upon a time there were 2 aardvark that could not swim",
                "versioncreated": "2015-06-03T03:48:39.000Z"
            }
        ]
        """
        When we set api time limit to 36500
        When we get "news/feed"
        Then we get list with 4 items
        """
        {"_items": [{"_id": "urn:test1"}, {"_id": "urn:test2"}, {"_id": "urn:test3"}, {"_id": "urn:test4"}]}
        """
        When we get "news/feed?products=5e4cade4d69954b6d55ac09a"
        Then we get list with 2 items
        """
        {"_items": [{"_id": "urn:test1"}, {"_id": "urn:test3"}]}
        """
        When we get "news/feed?products=5e4cade4d69954b6d55ac09b"
        Then we get list with 2 items
        """
        {"_items": [{"_id": "urn:test2"}, {"_id": "urn:test4"}]}
        """

    @wip
    Scenario: Response provides a link to the next page
        Given "items"
        """
        [
            {
                "_id": "urn:test1", "body_html": "Once upon a time there was a single fish who could swim",
                "versioncreated": "2015-06-01T03:48:39.000Z"
            }, {
                "_id": "urn:test2", "body_html": "Once upon a time there were 2 fish who could swim",
                "versioncreated": "2015-06-02T03:48:39.000Z"
            }, {
                "_id": "urn:test3", "body_html": "Once upon a time there were 3 fish who could swim",
                "versioncreated": "2015-06-02T03:48:39.000Z"
            }, {
                "_id": "urn:test4", "body_html": "Once upon a time there were 4 fish who could swim",
                "versioncreated": "2015-06-03T03:48:39.000Z"
            }, {
                "_id": "urn:test5", "body_html": "Once upon a time there were 5 fish who could swim",
                "versioncreated": "2015-06-04T03:48:39.000Z"
            }
        ]
        """
        When we set api time limit to 36500
        When we get "news/feed?include_fields=body_html&max_results=2&products=#products._id#"
        Then we get list with 5 items
        """
        {
            "_items": [
                {"_id": "urn:test1", "body_html": "Once upon a time there was a single fish who could swim"},
                {"_id": "urn:test2", "body_html": "Once upon a time there were 2 fish who could swim"}
            ],
            "_links": {
                "next_page": {
                    "title": "News Feed",
                    "href": "news/feed?exclude_ids=urn:test2&include_fields=body_html&max_results=2&products=#products._id#&start_date=2015-06-02T03:48:39"
                }
            }
        }
        """
        Then we store NEXT_PAGE from HATEOAS
        When we get "#NEXT_PAGE#"
        Then we get list with 3 items
        """
        {
            "_items": [
                {"_id": "urn:test3", "body_html": "Once upon a time there were 3 fish who could swim"},
                {"_id": "urn:test4", "body_html": "Once upon a time there were 4 fish who could swim"}
            ],
            "_links": {
                "next_page": {
                    "title": "News Feed",
                    "href": "news/feed?exclude_ids=urn:test4&include_fields=body_html&max_results=2&products=#products._id#&start_date=2015-06-03T03:48:39"
                }
            }
        }
        """
        Then we store NEXT_PAGE from HATEOAS
        When we get "#NEXT_PAGE#"
        Then we get list with 1 items
        """
        {
            "_items": [
                {"_id": "urn:test5", "body_html": "Once upon a time there were 5 fish who could swim"}
            ],
            "_links": {
                "next_page": {
                    "title": "News Feed",
                    "href": "news/feed?exclude_ids=urn:test5&include_fields=body_html&max_results=2&products=#products._id#&start_date=2015-06-04T03:48:39"
                }
            }
        }
        """
        Then we store NEXT_PAGE from HATEOAS
        When we get "#NEXT_PAGE#"
        Then we get list with 0 items
        """
        {
            "_items": [],
            "_links": {
                "next_page": {
                    "title": "News Feed",
                    "href": "news/feed?exclude_ids=urn:test5&include_fields=body_html&max_results=2&products=#products._id#&start_date=2015-06-04T03:48:39"
                }
            }
        }
        """

    Scenario: Href is generated for each item
        Given "items"
        """
        [
            {
                "_id": "urn:test1", "body_html": "Once upon a time there was a single fish who could swim",
                "versioncreated": "2015-06-01T03:48:39.000Z"
            }, {
                "_id": "urn:test2", "body_html": "Once upon a time there were 2 fish who could swim",
                "versioncreated": "2015-06-02T03:48:39.000Z"
            }
        ]
        """
        When we set api time limit to 36500
        When we get "news/feed?include_fields=body_html&max_results=2&products=#products._id#"
        Then we get list with 2 items
        """
        {
            "_items": [
                {"_id": "urn:test1", "_links": {"self": {"href": "news/item/urn:test1", "title": "News Item"}}},
                {"_id": "urn:test2", "_links": {"self": {"href": "news/item/urn:test2", "title": "News Item"}}}
            ]
        }
        """

    Scenario: Parameter validation
        When we get "/news/feed?page=2"
        Then we get error 400
        """
        {"code": 400, "message": "Unexpected parameter (page)"}
        """
        When we get "/news/feed?page_size=25"
        Then we get error 400
        """
        {"code": 400, "message": "Unexpected parameter (page_size)"}
        """
        When we get "/news/feed?sort=versioncreated:desc"
        Then we get error 400
        """
        {"code": 400, "message": "Unexpected parameter (sort)"}
        """
        When we get "/news/feed?exclude_fields=versioncreated"
        Then we get error 400
        """
        {"code": 400, "message": "Exclude fields contains a non-allowed value"}
        """
