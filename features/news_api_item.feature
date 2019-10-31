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