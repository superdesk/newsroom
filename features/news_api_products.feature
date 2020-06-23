Feature: News API Products

  Scenario: Retrieve the permissioned products
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
        [{"name": "Sample Product",
        "decsription": "a description",
        "product_type": "news_api",
        "companies" : [
        "5ab03a87bdd78169bb6d0783",
        "5aa5e9fbbdd7810885f0dac1",
        "#companies._id#"
        ]
        },
        {"name": "Sample Product 2",
        "decsription": "another description",
        "product_type": "news_api",
        "companies" : [
        "5ab03a87bdd78169bb6d0783",
        "5aa5e9fbbdd7810885f0dac1"
        ]
        }]
        """
    When we get "account/products"
    Then we get list with 1 items
        """
        {"_items": [{
          "name": "Sample Product"
        }]}
        """

  Scenario: Retrieve a single product
     Given "companies"
        """
        [{"name": "Test Company", "is_enabled" : true}]
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
        [{"name": "Sample Product X",
        "decsription": "a description",
        "companies" : [
        "5ab03a87bdd78169bb6d0783",
        "5aa5e9fbbdd7810885f0dac1",
        "#companies._id#"
        ],
        "navigations" : [
            "5aa5e94ebdd7810884f66ed3"
        ],
        "sd_product_id" : null
        }]
        """
    When we get "account/products/#products._id#"
    Then we get OK response
    Then we get existing resource
        """
        {
          "name": "Sample Product X"
        }
        """

  Scenario: Can not retrieve a single product without a token
     Given "companies"
        """
        [{"name": "Test Company", "is_enabled" : true}]
        """
     Given "products"
        """
        [{"name": "Sample Product X",
        "decsription": "a description",
        "companies" : [
        "5ab03a87bdd78169bb6d0783",
        "5aa5e9fbbdd7810885f0dac1",
        "#companies._id#"
        ],
        "navigations" : [
            "5aa5e94ebdd7810884f66ed3"
        ],
        "sd_product_id" : null
        }]
        """
    When we get "account/products/#products._id#"
    Then we get error 401
