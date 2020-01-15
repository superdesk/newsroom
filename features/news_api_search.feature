Feature: News API Products

  Scenario: Simple query string request for fish
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim"},
        {"body_html": "Once upon a time there was a aardvark that could not swim"}]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A fishy Product",
        "decsription": "a product for those interested in fish",
        "companies" : [
          "#companies._id#"
        ],
        "query": "fish",
        "product_type": "news_api"
        }]
        """
    When we get "news/search?q=fish&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a fish who could swim"}
     ]}
     """

  Scenario: Simple start date query
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "versioncreated": "#DATE-5#" },
        {"body_html": "Once upon a time there was a aardvark that could not swim", "versioncreated": "#DATE-1#" }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
    When we get "news/search?start_date=now-2d&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a aardvark that could not swim"}
     ]}
     """

  Scenario: Simple start and end date query
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "versioncreated": "#DATE-5#" },
        {"body_html": "Once upon a time there was a quokka who could swim", "versioncreated": "#DATE-3#" },
        {"body_html": "Once upon a time there was a aardvark that could not swim", "versioncreated": "#DATE-1#" }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
    When we get "news/search?start_date=now-4d&end_date=now-2d&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a quokka who could swim"}
     ]}
     """

  Scenario: Absolute start and end date query
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "versioncreated": "2018-11-09 03:48:39.000Z" },
        {"body_html": "Once upon a time there was a quokka who could swim", "versioncreated": "2018-11-11 03:48:39.000Z" },
        {"body_html": "Once upon a time there was a aardvark that could not swim", "versioncreated": "2018-11-13 03:48:39.000Z" }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
    When we get "news/search?start_date=2018-11-11T03:48:38&end_date=2018-11-12T02:48:40&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a quokka who could swim"}
     ]}
     """
    When we get "news/search?start_date=2018-11-11&include_fields=body_html"
    Then we get list with 2 items
    """
     {"_items": [
        {"body_html": "Once upon a time there was a quokka who could swim"},
        {"body_html": "Once upon a time there was a aardvark that could not swim"}
     ]}
     """
   When we get "news/search?start_date=2018-11-09T10:48:39&timezone=Australia/Sydney&include_fields=body_html"
    Then we get list with 3 items
    """
     {"_items": [
        {"body_html": "Once upon a time there was a quokka who could swim"},
        {"body_html": "Once upon a time there was a aardvark that could not swim"},
        {"body_html": "Once upon a time there was a fish who could swim"}
     ]}
     """
    When we get "news/search?start_date=2018-11-12T01:48:38&end_date=2018-11-12T02:48:40"
    Then we get list with 0 items
     """
     {"_items": [
     ]}
     """

 Scenario: Can sort results
     Given "items"
        """
        [{"body_html": "Three", "versioncreated": "#DATE-3#" },
        {"body_html": "Five", "versioncreated": "#DATE-5#" },
        {"body_html": "One", "versioncreated": "#DATE-1#" }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&sort=versioncreated:asc&include_fields=body_html,versioncreated"
    Then we get list ordered by versioncreated with 3 items
    """
     {"_items": [
        {"body_html": "Five"},
        {"body_html": "Three"},
        {"body_html": "One"}
     ]}
     """

 Scenario: include fields
     Given "items"
        """
        [{"body_html": "Three", "versioncreated": "#DATE-3#", "headline": "Headline 1" },
        {"body_html": "Five", "versioncreated": "#DATE-5#", "headline": "Headline 2"  },
        {"body_html": "One", "versioncreated": "#DATE-1#", "headline": "Headline 3"  }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&include_fields=body_html"
    Then we get list with 3 items
    """
     {"_items": [
        {"body_html": "One"},
        {"body_html": "Three"},
        {"body_html": "Five"}
     ]}
     """

  Scenario: unkown include fields
     Given "items"
        """
        [{"body_html": "Three", "versioncreated": "#DATE-3#", "headline": "Headline 1" },
        {"body_html": "Five", "versioncreated": "#DATE-5#", "headline": "Headline 2"  },
        {"body_html": "One", "versioncreated": "#DATE-1#", "headline": "Headline 3"  }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&include_fields=headline"
   Then we get response code 400

 Scenario: exclude fields
     Given "items"
        """
        [{"body_html": "Three", "versioncreated": "#DATE-3#", "pubstatus": "usable1" },
        {"body_html": "Five", "versioncreated": "#DATE-5#", "pubstatus": "usable2"  },
        {"body_html": "One", "versioncreated": "#DATE-1#", "pubstatus": "usable3"  }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&exclude_fields=versioncreated"
    Then we get list with 3 items
    """
     {"_items": [
        {"pubstatus": "usable1"},
        {"pubstatus": "usable2"},
        {"pubstatus": "usable3"}
     ]}
     """


 Scenario: max results
     Given "items"
        """
        [{"body_html": "Three", "versioncreated": "#DATE-3#", "headline": "Headline 1" },
        {"body_html": "Five", "versioncreated": "#DATE-5#", "headline": "Headline 2"  },
        {"body_html": "One", "versioncreated": "#DATE-1#", "headline": "Headline 3"  }]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&page_size=2&page=1&sort=versioncreated:asc"
    Then we get list with 3 items
    """
     {"_items": [
        {"headline": "Headline 2"},
        {"headline": "Headline 1"}
     ]}
     """
    When we get "news/search?start_date=now-10d&page_size=2&page=2&sort=versioncreated:asc"
    Then we get list with 3 items
    """
     {"_items": [
        {"headline": "Headline 3"}
     ]}
     """


    Scenario: search by service
     Given "items"
        """
        [
            {
                "body_html": "Three",
                "versioncreated": "#DATE-3#",
                "headline": "Headline 1",
                "service": [
                    {
                        "code": "i",
                        "name": "International News"
                    }
                ]
            },
            {
                "body_html": "Five",
                "versioncreated": "#DATE-5#",
                "headline": "Headline 2",
                "service": [
                    {
                        "code": "a",
                        "name": "Domestic News"
                    }
                ]
            },
            {
                "body_html": "One",
                "versioncreated": "#DATE-1#",
                "headline": "Headline 3",
                "service": [
                    {
                        "code": "i",
                        "name": "International News"
                    }
                ]
            }
        ]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&service=a"
    Then we get list with 1 items
    """
     {"_items": [
        {"headline": "Headline 2"}
     ]}
     """

  Scenario: search by genre
     Given "items"
        """
        [
            {
                "body_html": "Three",
                "versioncreated": "#DATE-3#",
                "headline": "Headline 1",
                "genre": [
                    {
                        "code": "Article",
                        "name": "Article"
                    }
                ]
            },
            {
                "body_html": "Five",
                "versioncreated": "#DATE-5#",
                "headline": "Headline 2",
                "genre": [
                    {
                        "code": "SideBar",
                        "name": "Side Bar"
                    }
                ]
            },
            {
                "body_html": "One",
                "versioncreated": "#DATE-1#",
                "headline": "Headline 3",
                "genre": [
                    {
                        "code": "SideBar",
                        "name": "Side Bar"
                    }
                ]
            }
        ]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "type:text",
        "product_type": "news_api"
        }]
        """
   When we get "news/search?start_date=now-10d&genre=Article"
    Then we get list with 1 items
    """
     {"_items": [
        {"headline": "Headline 1"}
     ]}
     """

     Scenario: search by product
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A Product",
        "decsription": "a product for text",
        "companies" : [
          "#companies._id#"
        ],
        "query": "aardvark",
        "product_type": "news_api"
        }]
        """
     Given "items"
        """
        [
            {
                "body_html": "Three aardvark story",
                "versioncreated": "#DATE-3#",
                "headline": "Headline 1",
                "products": [
                    {
                        "code": "#products._id#",
                        "name": "A Product"
                    },
                    {
                        "code": "1234",
                        "name": "Product b"
                    }
                ]
            },
            {
                "body_html": "Five",
                "versioncreated": "#DATE-5#",
                "headline": "Headline 2",
                "products": [
                    {
                        "code": "1234",
                        "name": "Broduct b"
                    }
                ]
            },
            {
                "body_html": "One",
                "versioncreated": "#DATE-1#",
                "headline": "Headline 3",
                "products": [
                    {
                        "code": "4321",
                        "name": "Product C"
                    }
                ]
            }
        ]
        """
   When we get "news/search?start_date=now-10d&products=#products._id#"
    Then we get list with 1 items
    """
     {"_items": [
        {"headline": "Headline 1"}
     ]}
     """

  @rate_limit
  Scenario: X-RateLimit-Remaining header is set in response
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim"},
        {"body_html": "Once upon a time there was a aardvark that could not swim"}]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A fishy Product",
        "decsription": "a product for those interested in fish",
        "companies" : [
          "#companies._id#"
        ],
        "query": "fish",
        "product_type": "news_api"
        }]
        """
    When we get "news/search?q=fish&include_fields=body_html"
    Then we get headers in response
      """
      [{ "X-RateLimit-Remaining": "1" }]
      """

  @rate_limit
  Scenario: X-RateLimit-Reset header is set in response
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim"},
        {"body_html": "Once upon a time there was a aardvark that could not swim"}]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true
        }
        ]
        """
     Given "news_api_tokens"
        """
        [{
          "company" : "#companies._id#",
          "enabled" : true
        }]
        """
     When we save API token
     Given "products"
        """
        [{"name": "A fishy Product",
        "decsription": "a product for those interested in fish",
        "companies" : [
          "#companies._id#"
        ],
        "query": "fish",
        "product_type": "news_api"
        }]
        """
    When we get "news/search?q=fish&include_fields=body_html"
    Then we get headers in response
      """
      [{ "X-RateLimit-Reset":  "__any_value__"}]
      """
