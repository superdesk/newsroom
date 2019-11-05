Feature: News API Item

  Scenario: Retrieve an item
    Given "items"
    """
    [{
      "_id": "111",
      "pubstatus": "usable",
      "headline": "Headline of the story"
    }]
    """
    When we get "v1/news/item/#items._id#"
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
    When we get "v1/news/item/#items._id#?format=bogus"
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
    When we get "v1/news/item/999"
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
    When we get "v1/news/item/111?version=5"
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
    When we get "v1/news/item/#items._id#?format=NINJSFormatter"
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
      When we get "v1/news/item/#items._id#?format=NINJSFormatter"
      Then we get response code 404
