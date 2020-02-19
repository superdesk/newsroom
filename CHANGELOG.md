# Newsroom Changelog

## [1.18.0] 2020-02-20
### Features
- News API
    - [SDAN-550] Add token resource for news API (#835)
    - [SDAN-546] Add 'News API' section filters (#837)
    - [SDAN-542] Ability to manage Company API Tokens (#839)
    - [SDAN-547] News API time limit setting (#852)
    - [SDAN-542] fix(api-key) Unable to set expiry to never (#851)
    - [SDAN-551] Initialize the news API app (#862)
    - [SDAN-552] Implement API token authentication (#866)
    - [SDAN-553] Add Products to the news api (#871)
    - [SDAN-556][SDAN-557] News API return item in requested format (#883)
    - [SDAN-607] Add NINJS formatter (#885)
    - fix(API item expiry) stop the API returning expired items (#887)
    - [SDAN-554] Search endpoint for News API (#900)
    - [SDAN-554] News API search paging, absolute date search fixes (#934)
    - [SDAN-630] Use base class for Web and NewsAPI apps (#950)
    - [SDAN-606] (fix): API token expiry stored as string instead of datetime (#946)
    - [SDAN-544][SDAN-561] IP whitelisting feature for News API (#947)
    - [SDAN-630] (fix): incorrect app import for manage.py (#953)
    - [SDAN-560] Rate Limiting for News API (#951)
    - [SDAN-563] News API Audit (#952)
    - [SDAN-562] Company API Usage report (#955)
- Monitoring
    - [SDAN-440] Create and Schedule Watch Lists for a company. also add a section filter (#869)
    - [SDAN-440] Watch Lists configuration - minor fixes (#877)
    - [SDAN-441] User and Watch List Administrator activities (#884)
    - [SDAN-440] Include 'keywords' in watch_list creation and other bug-fixes around watch_list settings feature (#889)
    - [SDAN-442] Watch Lists view page (#892)
    - [SDAN-443] Watchlists email alerts (#901)
    - [SDAN-623] Rename watch_lists to 'monitoring' across the system (#935)
    - [SDAN-627] Add monitoring icon (#939)
    - [SDAN-633] Formatting monitoring outputs for alerts, exports, share and print (#957)
    - Customizing RTF and PDF files to monitoring. (#960)
    - [SDAN-633] Allow customisation of monitoring logo (#964)
    - [SDAN-647] Add a 'Layout' dropdown option when downloading items from monitoring (#969)
    - [SDAN-648] Bug fixes around Monitoring (#971)
    - [SDAN-648] Minor style changes to PDF reports in Monitoring (#975)
    - [SDAN-648] Line spacings for monitoring PDF report (#980)

### Improvements
- [SDAN-635] Break words meaningfully on location display in Agenda (#962)
- [SDAN-636] Advertise Scheduled Updates in Newsroom Agenda (#968)
- [SDAN-634] Changes to Agenda tiles displayed on Newsroom wire stories (#965)
- [SDAN-634] Show only other coverages in Agenda tile on wire items (#972)
- [SDAN-651] Reduce size of heading in Agenda Watch email (#978)

### Fixes
- build fix while using _expand_contact_info in json_event formatter (#963)
- [SDAN-638] Show 'View Content' to Graphic coverages (#961)
- [SDAN-643][SDAN-644]'Reason for' not being displayed for Cancelled Coverages in Agenda, Coverage ednote not seen (#966)
- fix(pytest): Cyclic import error when running single test file (#967)
- [SDAN-655] Previewing an agenda item with a coverage crashes react (#970)
- fix(tests): Use same werkzeug version as eve 0.7.8 (#973)
- [SDAN-649] Share/delete icons not showing in my topic pages (#976)
- [SDAN-654] ContentActivity should report on all versions (#977)
- [SDAN-650][SDAN-656] Story updates are not triggering emails for watched coverages, 'Forbidden' error raised when unwatching certain coverages (#979)
- [SDAN-656] Coverage update repeated in watched coverage email (#981)
- [SDAN-658] fix duplicate take key in slugline view elements (#982)
- [SDAN-654] Add 'anpa_take_key' to elastic query response for ContentActivity (#984)

## [1.17.1] 2020-01-29
### Features
- [SDAN-632] ContentActivity report (#954)

### Improvements
- [SDAN-628] Improve email subject when watching ad-hoc planning item (#942)
- [SDAN-586] Make the 'Superdesk Subscriber Id' column visibility configurable in the Company list (#944)
- [SDAN-624] Display Take Key when Downloading, Copying, Printing and Sharing wire items (#943)

### Fixes
- [SDAN-639] Notifications dropdown was not fully visible (#941)
- [SDAN-631] The 'PRINT REPORT' action produces a page without any report data (#945)
- fix(push): Exception raised when receiving new completed coverages (#948)
- fix(coverage-href): Catch all exceptions when generating coverage href (949)
- fix(travis-ci): Force install of google-chrome

## [1.17.0] 2019-12-17
### Features
- [SDAN-614] Watch individual coverages (#910)
- [SDAN-600] Item action to remove wire based items (#928)

### Improvements
- [SDAN-603] Configure logging to add timestamp for log messages (#890)
- [SDAN-613] Provide byline/hyperlink for featuremedia images (#894)
- [SDCP-110] Adding optional preview configuration for actions in newshub (#905)
- [SDCP-115] Making newsonly toggle optional (#906)
- [SDCP-114] Consent checkbox for user sign up (#908)
- [SDAN-617] Add 'account_manager' to Company report (#915)
- [SDAN-620] Improvements to coverage inquiry email (#913)
- [SDAN-621] Audit Information for forms in the settings (#927)
- [SDAN-622] Append 'anpa_take_key' to slugline in views (#929)
- [SDAN-620] Change to make mail-to common for all email links in the Coverage Inquiry email (#933)
- [SDAN-614] Minor UI changes to watching individual coverages (#930)
- [SDAN-625] Improve rendering performance of Agenda list (#937)

### Fixes
- [SDAN-616] Use current time to populate date filter for media hrefs (#893)
- PR to fix failing tests due to pytest-mock plugin (#903)
- [SDCP-42] - Download button is disabled in home page (#895)
- fix(my topics): Standard user is unable to search navigations endpoint (#907)
- use single domain for translations (#909)
- [SDAN-610] Photo coverage URL should not be generated on push but on get from the client (#896)
- [SDAN-613] Corrected byline text and hyper-link for photo (#904)
- Fix sending emails via celery (#916)
- fix(dev-requirements): Add responses lib (#918)
- [SDAN-615] Unable to remove all filter parameters from a Topic (#914)
- support mail username config (#921)
- fix tests setup (#920)
- [SDAN-619] Correct tagging for AM Weather (#922)
- [SDAN-615] Unable to empty filters on a topic (#923)
- fix(celery): Incorrect reference to app in dumps/loads (#932)
- fix(celery): Use newsroom.flask_app instead of flask.current_app (#936)

## [1.16.1] 2019-11-04
### Improvements
- [SDAN-609] Support multi-line internal and editorial note (#886)

### Fixes
- [SDAN-611](fix): Invalid URL params in the share topic email (#882)

## [1.16.0] 2019-10-31
### Features
- None

### Improvements
- [SDAN-582] Save topic with multiple navigations (#876)
- [SDAN-581] Allow multi-selecting Navigation topics (#850)

### Fixes
- [SDAN-605] Image and Video coverages are not showing a 'coverage available' date/time (#874)
- [SDAN-608] 'View Content' button not visible on some coverages in Full View Mode (#873)
- [SDAN-602] 'Update to come' was not clearing when news item related to agenda was published (#868)
- [SDAN-604] Preview of an Event fails if the links attribute is null (#872)
- [SDAN-602] Coverage Status text should not change before an Update has been published (#867)
- [SDAN-582](fix): Agenda featured toggle not showing (#879)
- [SDAN-582](fix): Unable to create or update My Agenda topic (#880)
- [SDAN-582](fix): Cannot share a topic (#881)

## [1.15.2] 2019-10-17
### Features
- None

### Improvements
- Add ANA logo (#856)
- [SDCP-25] Allow new users to register their interests (#857)
- [SDAN-596] Pressing back button on a mobile phone when the preview is open should close the preview (#859)
- [SDAN-599] 'Time to be confirmed' feature for Agenda Items (#860)
- [SDAN-588] Use Topic instead of Events in navigation labels (#863)
- [SDAN-599] Display changes to 'Time to be confirmed' label (#864)

### Fixes
- Use default Ubuntu in Travis (#853)
- [SDAN-598] fix: Save button not being enabled when turning off topic notifications (#855)
- [SDAN-595] fix(agenda-emails) Use correct url_for method (#854)
- Updating superdesk-core version for newsroom package (#861)

## [1.15.1] 2019-09-10
### Features
- None

### Improvements
- None

### Fixes
- [SDAN-594] Previewing past or future Agenda item from email displays list not the preview (#848)
- Save Topic and Save Events 'SAVE' button was disabled while saving (#849)

## [1.15] 2019-09-09
### Features
- None

### Improvements
- [SDAN-578][SDAN-579] 'Account Manager' field in Company schema and use that in Company Expiry alerts (#832)
- [SDAN-570] Fixes/Improvements to the 'share' action (#838)
- [SDAN-591] Improve company expiry email layout and text (#841)
- [SDAN-570] Changes to 'share' item template (#842)
- [SDAN-572] Style changes to display 'Event Completed' label (#843)
- [SDAN-568] Improve responsive behaviour for mobile phones (#834)
- [SDAN-568] Further response layout improvements (#844)

### Fixes
- [SDAN-583] Preview for items that aren't wire or agenda in the Subscriber Activity report don't show the body text (#831)
- [SDAN-580] Remove company expiry check from user login and notifications (#833)
- [SDAN-587] Ignore agenda when applying time limit to search (#836)
- [SDAN-590] (fix): Celery beat and queue configs (#840)
- [SDAN-592] Coverages in the Agenda Share/Print Preview are misaligned (#845)
- [SDAN-593] Show all event coverages if no planning item selected (#847)

## [1.14] 2019-08-22
### Features
- [SDAN-538] Add the ability to execute the remove expired command (#817)

### Improvements
- [SDAN-572] Label completed agenda items as 'Completed' (#829)
- [SDAN-572][SDAN-567] UI changes in displaying 'byline', 'located' and 'slugline' (#823)
- [SDAN-565] Reposition the 'show map' text in Agenda Preview (#821)
- [SDAN-566] Add 'preview' and 'open' to 'actions' filter in subscriber activity report (#822)
- [SDAN-524][SDAN-530] Record 'open' and 'preview' actions in history collection (#815)
- [SDAN-519] Toggle map display in Agenda Preview (#811)

### Fixes
- [SDAN-585] (fix): Corrections showing up as 'Updates Coming' (#830)
- [SDAN-569] Market Place Bookmarks were not seen (#828)
- UI fix to add padding after 'published' and remove 'on created_time' in wire ite, detail (#826)
- fix creating new dashboard card when there is single dashboard type (#827)
- [SDAN-576] Prefer description_text over body_text for image captions (#825)
- [SDAN-575] Internal note on coverages is visible for public users in Newsroom (#824)
- [SDAN-548] ednote from wire item was not displayed in Agenda coverage. (#818)
- [SDAN-549] Text from wire items were not updating in Agenda preview (#818)
- [SDAN-531] Push errors when event is created from a planning item (#814)
- [SDAN-516] Show agency logos for AAPX (#816)
- [SDAN-535] Add 'located' attribute as 'Location' when a wire item is copied (#813)

## [1.13.1] 2019-07-18
- [SDAN-532] Fetch card external item details after loading the page (#812)

## [1.13] 2019-07-16
- [SDAN-529] Fix incorrect coverage scheduled date in Agenda notification email
- [SDAN-514] Changes to Watched Agenda Emails (#808)
- [SDAN-526] Draft coverage tooltip change and display all regions in filter if vocabulary is present (#807)
- [SDAN-527] null delivery sequence_no in coverage was causing push error
- [SDAN-512] Grey fill companies which are disabled in Company Management List
- [SDAN-525] Disable user text selection in item preview
- [SDAN-502] Bug fix when using locators vocabularies for Region filter in Agenda
- [SDAN-514] Notification Email restructure for watched Agenda items
- [SDAN-518] Coverage's ednote should be overwritten by news item's ednote
- [SDAN-502] Add 'locators' vocabulary and use it to group and detail regions dropdown in agenda
- [SDAN-511] Apply sorting to user management
- [SDAN-512] Grey fill rows of a disabled company in company reports
- [SDAN-513] In subscriber Activity report, remove the background fill from the list
- [SDAN-517] Displayed agenda_links should open Agenda in a new tab when opened in Wire
- [SDAN-501] Publish time in delivery record is not taking content item's publish schedule into account
- [SDAN-510] Event created from adhoc planning item was creating new event in Agenda
- [SDESK-506] Add mapping for graphic name
- [SDAN-497] Change label for archive acccess
- [SDAN-508] Pagination problems in subscriber activity report
- [SDAN-499] Add Headline to Planning not linked to an Event
- [SDAN-505] Alphabetically sort Users in User Management based on last_name
- [SDAN-500] 'Sections' filter for subscriber activity report

## [1.12] 2019-05-27
- fix(User Management) fix layout for company dropdown in user management
- [SDAN-481] Subscriber Activity Report
- [SDAN-496] Availability value for aapX content
- [STTNHUB-65] - Embargoed items should not appear in cards
- [SDAN-480, SDAN-483] Add last active time for user and filter user list by company Using MAIL_FROM for the from address
- [SDAN-498] Item URL in coverage requests form was not working when top-stories feature was turned on
- [SDAN-503] Remove user_ids from elastic query when getting list of item history on push
- [SDAN-504] Add timestamp and direction options to index_from_mongo


## [1.11] 2019-05-09
- [SDAN-493] Update planning tile and coverage icon when update is coming
- [SDAN-494] 'View Content' link was not available for completed media coverages
- Logout user if the company or user is disabled.
- [SDAN-492] Coverage with linked updates UI bugs
- [SDAN-491] Changes to labelling for the 'All Events & Coverages' Filter in Agenda.
- Added notes to preview panel
- Using agenda resource only for planning items
- [SDAN-403] Adding toggle filter for events only view.
- [SDAN-488] Add COVERAGE_REQUEST_RECIPIENTS to Newsroom general setting
- [SDAN-464] Extend the Coverage concept to include iterations/updates to the original text coverage item
- [SDAN-490] New agenda and story notifications were not working. And unpost was not removing item from list
- [SDAN-476] Adding Newsroom section for Media Release content.
- [SDAN-479] Minor changes to date shown in Agenda list view section headers
- [STTNHUB-58] - Display notes in details
- [SDAN-494] View Content was not visible for media coverages
- [SDAN-476] Adding Newsroom section for Media Release content.
