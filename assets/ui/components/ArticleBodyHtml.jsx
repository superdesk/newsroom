import React from 'react';
import PropTypes from 'prop-types';
import {get, memoize} from 'lodash';
import {formatHTML} from 'utils';
import {connect} from 'react-redux';
import {selectCopy} from '../../wire/actions';

/**
 * using component to fix iframely loading
 * https://iframely.com/docs/reactjs
 */
class ArticleBodyHtml extends React.PureComponent {
    constructor(props) {
        super(props);
        this.copyClicked = this.copyClicked.bind(this);
        this.clickClicked = this.clickClicked.bind(this);

        // use memoize so this function is only called when `body_html` changes
        this.getBodyHTML = memoize(this._getBodyHTML.bind(this));

        this.bodyRef = React.createRef();
    }

    componentDidMount() {
        this.loadIframely();
        this.executeScripts();
        document.addEventListener('copy', this.copyClicked);
        document.addEventListener('click', this.clickClicked);
    }

    clickClicked(event) {
        if (event != null) {
            const target = event.target;

            if (target && target.tagName === 'A' && this.isLinkExternal(target.href)) {
                event.preventDefault();
                event.stopPropagation();

                // security https://mathiasbynens.github.io/rel-noopener/
                var nextWindow = window.open();

                nextWindow.opener = null;
                nextWindow.location.href = target.href;
            }
        }
    }

    isLinkExternal(href) {
        try {
            const url = new URL(href);

            // Check if the hosts are different and protocol is http or https
            return url.host !== window.location.host && ['http:', 'https:'].includes(url.protocol);
        } catch (e) {
            // will throw if string is not a valid link
            return false;
        }
    }

    componentDidUpdate() {
        this.loadIframely();
        this.executeScripts();
    }

    loadIframely() {
        const html = get(this.props, 'item.body_html', '');

        if (window.iframely && html && html.includes('iframely')) {
            window.iframely.load();
        }
    }

    executeScripts() {
        const tree = this.bodyRef.current;
        const loaded = [];

        if (tree == null) {
            return;
        }

        if (window.Plyr != null) {
            window.Plyr.setup('.js-player');
        }

        tree.querySelectorAll('script').forEach((s) => {
            if (s.hasAttribute('src') && !loaded.includes(s.getAttribute('src'))) {
                let url = s.getAttribute('src');

                loaded.push(url);

                if (url.includes('twitter.com/') && window.twttr != null) {
                    window.twttr.widgets.load();
                    return;
                }

                if (url.includes('instagram.com/') && window.instgrm != null) {
                    window.instgrm.Embeds.process();
                    return;
                }

                // Force Flourish to always load
                if (url.includes('flourish.studio/')) {
                    delete window.FlourishLoaded;
                }

                if (url.startsWith('http')) {
                    // change https?:// to // so it uses schema of the client
                    url = url.substring(url.indexOf(':') + 1);
                }

                const script = document.createElement('script');

                script.src = url;
                script.async = true;

                script.onload = () => {
                    document.body.removeChild(script);
                };

                script.onerrror = (error) => {
                    throw new URIError('The script ' + error.target.src + 'didn\'t load.');
                };

                document.body.appendChild(script);
            }
        });
    }

    copyClicked() {
        this.props.reportCopy(this.props.item);
    }

    componentWillUnmount() {
        document.removeEventListener('copy', this.copyClicked);
        document.removeEventListener('click', this.clickClicked);
    }

    _getBodyHTML(bodyHtml) {
        return !bodyHtml ?
            null :
            this._updateImageEmbedSources(formatHTML(bodyHtml));
    }

    /**
     * Update Image Embeds to use the Web APIs Assets endpoint
     *
     * @param html - The `body_html` value (could also be the ES Highlight version)
     * @returns {string}
     * @private
     */
    _updateImageEmbedSources(html) {
        const item = this.props.item;

        // Get the list of Original Rendition IDs for all Image Associations
        const imageEmbedOriginalIds = Object
            .keys(item.associations || {})
            .filter((key) => key.startsWith('editor_'))
            .map((key) => get(item.associations[key], 'renditions.original.media'))
            .filter((value) => value);

        if (!imageEmbedOriginalIds.length) {
            // This item has no Image Embeds
            // return the supplied html as-is
            return html;
        }

        // Create a DOM node tree from the supplied html
        // We can then efficiently find and update the image sources
        const container = document.createElement('div');
        let imageSourcesUpdated = false;

        container.innerHTML = html;
        container
            .querySelectorAll('img')
            .forEach((imageTag) => {
                // Using the tag's `src` attribute, find the Original Rendition's ID
                const originalMediaId = imageEmbedOriginalIds.find((mediaId) => (
                    !imageTag.src.startsWith('/assets/') &&
                    imageTag.src.includes(mediaId))
                );

                if (originalMediaId) {
                    // We now have the Original Rendition's ID
                    // Use that to update the `src` attribute to use Newshub's Web API
                    imageSourcesUpdated = true;
                    imageTag.src = `/assets/${originalMediaId}`;
                }
            });

        // Find all Audio and Video tags and mark them up for the player
        container.querySelectorAll('video, audio')
            .forEach((vTag) => {
                vTag.classList.add('js-player');
                if (vTag.getAttribute('data-disable-download')) {
                    vTag.setAttribute('data-plyr-config', '{"controls": ["play-large", "play",' +
                        '"progress", "volume", "mute", "rewind", "fast-forward", "current-time",' +
                        '"captions", "restart", "duration"]}');

                } else {
                    vTag.setAttribute('data-plyr-config', '{"controls": ["play-large", "play",' +
                        '"progress", "volume", "mute", "rewind", "fast-forward", "current-time",' +
                        '"captions", "restart", "duration", "download"], "urls": {"download": ' +
                        '"' + vTag.getAttribute('src') + '?item_id=' + item._id + '"' +
                        '}}');
                }

                imageSourcesUpdated = true;
            });

        // If Image tags were not updated, then return the supplied html as-is
        return imageSourcesUpdated ?
            container.innerHTML :
            html;
    }

    render() {
        const item = this.props.item;
        const html = this.getBodyHTML(
            get(item, 'es_highlight.body_html.length', 0) > 0 ?
                item.es_highlight.body_html[0] :
                item.body_html
        );

        if (!html) {
            return null;
        }

        return (
            <div
                ref={this.bodyRef}
                className='wire-column__preview__text'
                id='preview-body'
                dangerouslySetInnerHTML={({__html: html})}
            />
        );
    }
}

ArticleBodyHtml.propTypes = {
    item: PropTypes.shape({
        body_html: PropTypes.string,
        _id: PropTypes.string,
        es_highlight: PropTypes.shape({
            body_html: PropTypes.arrayOf(PropTypes.string),
        }),
        associations: PropTypes.object,
    }).isRequired,
    reportCopy: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
    reportCopy: (item) => dispatch(selectCopy(item))
});

export default connect(null, mapDispatchToProps)(ArticleBodyHtml);