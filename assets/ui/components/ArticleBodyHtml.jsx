import React from 'react';
import PropTypes from 'prop-types';
import {get, memoize} from 'lodash';
import {formatHTML} from 'utils';
import {connect} from 'react-redux';
import {selectCopy} from '../../wire/actions';
import DOMPurify from 'dompurify';
const fallbackDefault = '/static/poster_default.jpg';

class ArticleBodyHtml extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            sanitizedHtml: '',
        };
        this.copyClicked = this.copyClicked.bind(this);
        this.clickClicked = this.clickClicked.bind(this);
        this.preventContextMenu = this.preventContextMenu.bind(this);
        this.getBodyHTML = memoize(this._getBodyHTML.bind(this));
        this.bodyRef = React.createRef();
        this.players = new Map();
    }

    componentDidMount() {
        this.updateSanitizedHtml();
        this.loadIframely();
        this.setupPlyrPlayers();
        this.executeScripts();
        document.addEventListener('copy', this.copyClicked);
        document.addEventListener('click', this.clickClicked);
        this.addContextMenuEventListeners();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            this.updateSanitizedHtml();
        }
        this.loadIframely();
        this.executeScripts();
        this.setupPlyrPlayers();
        this.addContextMenuEventListeners();
    }

    componentWillUnmount() {
        document.removeEventListener('copy', this.copyClicked);
        document.removeEventListener('click', this.clickClicked);
        this.removeContextMenuEventListeners();

        this.players.forEach(player => player.destroy());
        this.players.clear();
    }

    updateSanitizedHtml() {
        const item = this.props.item;
        const html = this.getBodyHTML(
            get(item, 'es_highlight.body_html.length', 0) > 0 ?
                item.es_highlight.body_html[0] :
                item.body_html
        );
        this.sanitizeHtml(html);
    }

    sanitizeHtml(html) {
        if (!html) {
            this.setState({sanitizedHtml: ''});
            return;
        }
        const sanitizedHtml = DOMPurify.sanitize(html, {
            ADD_TAGS: ['iframe', 'video', 'audio', 'figure', 'figcaption', 'script', 'twitter-widget', 'fb:like',
                'blockquote', 'div'],
            ADD_ATTR: [
                'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height',
                'data-plyr-config', 'data-plyr', 'aria-label', 'aria-hidden', 'focusable',
                'class', 'role', 'tabindex', 'controls', 'download', 'target',
                'async', 'defer', 'data-tweet-id', 'data-href',
                'data-instgrm-captioned', 'data-instgrm-permalink',
                'data-flourish-embed', 'data-src'
            ],
            ALLOW_DATA_ATTR: true,
            ALLOW_UNKNOWN_PROTOCOLS: true,
            KEEP_CONTENT: true
        });
        this.setState({sanitizedHtml});
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

                script.onerror = (error) => {
                    console.error('Script load error:', error);
                    throw new URIError('The script ' + error.target.src + ' didn\'t load.');
                };

                document.body.appendChild(script);
            }
        });
    }

    setupPlyrPlayers() {
        const tree = this.bodyRef.current;
        if (tree == null || window.Plyr == null) {
            return;
        }

        tree.querySelectorAll('.js-player:not(.plyr--setup)').forEach(element => {
            if (!this.players.has(element)) {
                const player = new window.Plyr(element, {
                    seekTime: 1,
                    keyboard: {focused: true, global: true},
                    tooltips: {controls: true, seek: true},
                    captions: {active: true, language: 'auto', update: true}
                });
                this.players.set(element, player);
                this.checkVideoLoading(player, element.getAttribute('src'));
                this.setupMovePlayback(player);
            }
        });
    }

    setupMovePlayback(player) {
        const container = player.elements.container;
        let isScrubbing = false;
        let wasPaused = false;

        container.addEventListener('mousedown', startScrubbing);
        document.addEventListener('mousemove', scrub);
        document.addEventListener('mouseup', stopScrubbing);

        function startScrubbing(event) {
            if (event.target.closest('.plyr__progress')) {
                isScrubbing = true;
                wasPaused = player.paused;
                player.pause();
                scrub(event);
            }
        }

        function scrub(event) {
            if (!isScrubbing) return;

            const progress = player.elements.progress;
            const rect = progress.getBoundingClientRect();
            const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
            player.currentTime = percent * player.duration;
        }

        function stopScrubbing() {
            if (isScrubbing) {
                isScrubbing = false;
                if (!wasPaused) {
                    player.play();
                }
            }
        }

    }

    checkVideoLoading(player, videoSrc) {
        if (!videoSrc || !videoSrc.startsWith('/assets/')) {
            return;
        }
        const loadHandler = () => {
            const checkVideoContent = () => {
                if (player.media.videoWidth > 0 && player.media.videoHeight > 0) {
                    const canvas = document.createElement('canvas');
                    canvas.width = player.media.videoWidth;
                    canvas.height = player.media.videoHeight;
                    const ctx = canvas.getContext('2d');

                    ctx.drawImage(player.media, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    // loop for none blank pixel
                    let stepSize = 10; // Adjust the step size
                    for (let i = 0; i < data.length; i += stepSize * 4) {
                        if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) {
                            console.warn('Pixel content detected, poster not needed');
                            return true;
                        }
                    }
                }
                return false;
            };

            const attemptContentCheck = () => {
                if (checkVideoContent()) {
                    player.poster = null;
                    console.warn('Pixel content detected, poster removed');
                    return true;
                }
                return false;
            };

            let attemptCount = 0;
            const maxAttempts = 1;
            const checkInterval = setInterval(() => {
                if (attemptContentCheck() || attemptCount >= maxAttempts) {
                    clearInterval(checkInterval);
                    player.off('loadeddata', loadHandler);

                    if (attemptCount >= maxAttempts) {
                        console.warn('Setting fallback poster');
                        player.poster = fallbackDefault;
                    }
                }
                attemptCount++;
            }, 500);
        };

        player.on('error', (error) => {
            console.error('Error details and location:', {
                message: error.message,
                code: error.code,
                type: error.type,
                target: error.target,
                currentTarget: error.currentTarget,
                originalTarget: error.originalTarget,
                error: error.error
            });
            player.poster = fallbackDefault;
        });
        player.on('loadeddata', loadHandler);
    }

    _getBodyHTML(bodyHtml) {
        return !bodyHtml ?
            null :
            this._updateImageEmbedSources(formatHTML(bodyHtml));
    }

    _updateImageEmbedSources(html) {
        const item = this.props.item;

        const imageEmbedOriginalIds = Object
            .keys(item.associations || {})
            .filter((key) => key.startsWith('editor_'))
            .map((key) => get(item.associations[key], 'renditions.original.media'))
            .filter((value) => value);

        if (!imageEmbedOriginalIds.length) {
            return html;
        }

        const container = document.createElement('div');
        let imageSourcesUpdated = false;

        container.innerHTML = html;
        container
            .querySelectorAll('img,video,audio')
            .forEach((imageTag) => {
                const originalMediaId = imageEmbedOriginalIds.find((mediaId) => (
                    !imageTag.src.startsWith('/assets/') &&
                    imageTag.src.includes(mediaId))
                );

                if (originalMediaId) {
                    imageSourcesUpdated = true;
                    imageTag.src = `/assets/${originalMediaId}`;
                }
            });

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
        return imageSourcesUpdated ?
            container.innerHTML :
            html;
    }

    clickClicked(event) {
        if (event != null) {
            const target = event.target;
            if (target && target.tagName === 'A' && this.isLinkExternal(target.href)) {
                event.preventDefault();
                event.stopPropagation();
                const nextWindow = window.open(target.href, '_blank', 'noopener');

                if (nextWindow) {
                    nextWindow.opener = null;
                }
            }
        }
    }

    isLinkExternal(href) {
        try {
            const url = new URL(href);
            return url.host !== window.location.host && ['http:', 'https:'].includes(url.protocol);
        } catch (e) {
            return false;
        }
    }

    copyClicked() {
        this.props.reportCopy(this.props.item);
    }

    addContextMenuEventListeners() {
        const tree = this.bodyRef.current;
        if (tree) {
            tree.querySelectorAll('[data-disable-download="true"]').forEach((element) => {
                element.addEventListener('contextmenu', this.preventContextMenu);
            });
        }
    }

    removeContextMenuEventListeners() {
        const tree = this.bodyRef.current;
        if (tree) {
            tree.querySelectorAll('[data-disable-download="true"]').forEach((element) => {
                element.removeEventListener('contextmenu', this.preventContextMenu);
            });
        }
    }

    preventContextMenu(event) {
        event.preventDefault();
    }

    render() {
        if (!this.state.sanitizedHtml) {
            return null;
        }

        return (
            <div>
                <div
                    ref={this.bodyRef}
                    className='wire-column__preview__text'
                    id='preview-body'
                    dangerouslySetInnerHTML={{__html: this.state.sanitizedHtml}}
                />
            </div>
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
