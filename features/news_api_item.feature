Feature: News API Item

  Background: Initial setup
    Given "companies"
      """
      [{"name": "Test Company", "is_enabled" : true}]
      """
    Given "news_api_tokens"
      """
      [{"company" : "#companies._id#", "enabled" : true}]
      """
    When we save API token

  Scenario: Retrieve an item
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story"
    }]
    """
    When we get "/news/item/#items._id#"
    Then we get OK response

  Scenario: Attempt to Retrieve an item with unknown format
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story"
    }]
    """
    When we get "/news/item/#items._id#?format=bogus"
    Then we get response code 404

  Scenario: Retrieve an item that does not exist
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story"
    }]
    """
    When we get "/news/item/999"
    Then we get response code 404

  Scenario: Retrieve a version of an item
    Given "items_versions"
    """
    [{
      "_id_document": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story",
      "version" : "5"
    }]
    """
    When we get "/news/item/111?version=5"
    Then we get OK response

  Scenario: Retrieve an item in ninjs
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story"
    }]
    """
    When we get "/news/item/#items._id#?format=NINJSFormatter"
    Then we get existing resource
    """
     {"guid": "111",
     "headline": "Headline of the story"}
    """

  Scenario: Attempt to retrieve an expired item
    Given "items"
      """
      [{
        "_id": "111",
        "pubstatus": "usable",
        "headline": "Headline of the story",
        "versioncreated": "2018-11-01T03:01:40.000Z"
      }]
      """
    When we get "/news/item/#items._id#?format=NINJSFormatter"
    Then we get response code 404

  Scenario: Retrieve an item in text format
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story",
      "body_html": "<p>test&nbsp;test</p>"
    }]
    """
    When we get "/news/item/#items._id#?format=TextFormatter"
    Then we get OK response
    Then we get "test test" in text response

  Scenario: Retrieve an item with associations
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story",
      "body_html": "<p>test&nbsp;test</p>",
      "associations": {
        "featuremedia": {
          "products": ["12345", "6789"],
          "subscribers": ["12345", "6789"],
          "renditions": {
            "16-9": {
              "href": "/assets/1234567",
              "media": "/12345/6789.jpg"
            },
            "_newsroom_thumbnail": {
              "href": "/assets/987654"
            }
          }
        }
      }
    }]
    """
    When we get "/news/item/#items._id#?format=NINJSFormatter2"
    Then we get existing resource
    """
    {
      "guid": "111",
      "headline": "Headline of the story",
      "associations": {
        "featuremedia": {
          "renditions": {
            "16-9": {
              "href": "/assets/1234567"
            }
          }
        }
      }
    }
    """