Feature: News API News Search

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

  Scenario: Simple atom request response restricted by product
    Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "headline": "headline 1",
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"},
        {"body_html": "Once upon a time there was a aardvark that could not swim", "headline": "headline 2",
        "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"}]
        """
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
    When we get "atom"
    Then we get OK response
    Then we "get" "<title><![CDATA[headline 1]]></title>" in atom xml response
    Then we "don't get" "<title><![CDATA[headline 2]]></title>" in atom xml response

  Scenario: Simple atom request
    Given "items"
        """
        [{"body_html": "<p>Once upon a time there was a fish who could swim</p>", "headline": "headline 1",
        "byline": "S Smith", "pubstatus": "usable", "service" : [{"name" : "Australian General News", "code" : "a"}],
        "description_text": "summary",
        "associations" : {
            "featuremedia" : {
                "mimetype" : "image/jpeg",
                "description_text" : "Deputy Prime Minister Michael McCormack during Question Time",
                "version" : "1",
                "byline" : "Mick Tsikas/AAP PHOTOS",
                "body_text" : "QUESTION TIME ALT",
                "renditions" : {
                    "16-9" : {
                        "href" : "/assets/5fc5dce16369ab07be3325fa",
                        "height" : 720,
                        "width" : 1280,
                        "media" : "5fc5dce16369ab07be3325fa",
                        "poi" : {
                            "x" : 453,
                            "y" : 335
                        },
                        "mimetype" : "image/jpeg"
                    }
            }
        }},
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"}]
        """
    When we get "atom"
    Then we get OK response
    Then we "get" "<title><![CDATA[headline 1]]></title>" in atom xml response
    Then we "get" "<media:credit>Mick Tsikas/AAP PHOTOS</media:credit>" in atom xml response

  Scenario: Simple atom request with embedded image
    Given "items"
        """
        [{"body_html": "<p>Once upon a time there was a fish who could swim</p><!-- EMBED START Image {id: \"editor_19\"} --><figure><img src=\"somthing\" alt=\"alt text\" id=\"editor_19\"<figcaption>Some caption</figcaption></figure><!-- EMBED END Image {id: \"editor_19\"} -->",
        "headline": "headline 1",
        "byline": "S Smith", "pubstatus": "usable", "service" : [{"name" : "Australian General News", "code" : "a"}],
        "description_text": "summary",
        "associations" : {
            "editor_19" : {
                "mimetype" : "image/jpeg",
                "description_text" : "Deputy Prime Minister Michael McCormack during Question Time",
                "version" : "1",
                "byline" : "Mick Tsikas/AAP PHOTOS",
                "body_text" : "QUESTION TIME ALT",
                "renditions" : {
                    "16-9" : {
                        "href" : "/assets/5fc5dce16369ab07be3325fa",
                        "height" : 720,
                        "width" : 1280,
                        "media" : "5fc5dce16369ab07be3325fa",
                        "poi" : {
                            "x" : 453,
                            "y" : 335
                        },
                        "mimetype" : "image/jpeg"
                    }
            }
        }},
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"}]
        """
    When we get "atom"
    Then we get OK response
    Then we "get" "<title><![CDATA[headline 1]]></title>" in atom xml response
    Then we "get" "5fc5dce16369ab07be3325fa" in atom xml response
    Then we "get" "src="http://" in atom xml response
