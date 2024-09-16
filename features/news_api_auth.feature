Feature: News API Authorization

  Scenario: allowed_ip_list is used for request validation
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
          "is_enabled" : true,
          "allowed_ip_list": ["123.123.123.123/24"]
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
    Then we get response code 401


  Scenario: Proxy forward situation is handled appropirately
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "versioncreated": "#DATE#"},
        {"body_html": "Once upon a time there was a aardvark that could not swim", "versioncreated": "#DATE#"}]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true,
          "allowed_ip_list": ["123.123.123.123/24"]
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
    When we set header "X-Forwarded-For" to value "123.123.123.123, 192.192.192.192"
    When we get "news/search?q=fish&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a fish who could swim"}
     ]}
     """

  Scenario: Supports subnet in allowed_ip_list from request
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "versioncreated": "#DATE#"},
        {"body_html": "Once upon a time there was a aardvark that could not swim", "versioncreated": "#DATE#"}]
        """
     Given "companies"
        """
        [
        {
          "name": "Test Company",
          "is_enabled" : true,
          "allowed_ip_list": ["123.123.123.123/24"]
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
    When we set header "X-Forwarded-For" to value "123.123.123.1, 192.192.192.192"
    When we get "news/search?q=fish&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a fish who could swim"}
     ]}
     """

  @rate_limit
  @notification
  Scenario: RATE_LIMIT_REQUESTS config is used for request validation
     Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "versioncreated": "#DATE#"},
        {"body_html": "Once upon a time there was a aardvark that could not swim", "versioncreated": "#DATE#"}]
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
    When we get "news/search?q=fish&include_fields=body_html"
    Then we get list with 1 items
     """
     {"_items": [
         {"body_html": "Once upon a time there was a fish who could swim"}
     ]}
     """
     When we get "news/search?q=fish&include_fields=body_html"
     Then we get response code 429
