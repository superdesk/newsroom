import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { formatHTML } from 'utils';

/**
 * using component to fix iframely loading
 * https://iframely.com/docs/reactjs
 */
export default class ArticleBodyHtml extends React.PureComponent {
    componentDidMount() {
        this.loadIframely();
    }

    componentDidUpdate() {
        this.loadIframely();
    }

    loadIframely() {
        const html = get(this.props, 'item.body_html', '');

        if (window.iframely && html && html.includes('iframely')) {
            window.iframely.load();
        }
    }

    render() {
        const item = this.props.item;

        if (!item.body_html) {
            return null;
        }

        const html = formatHTML(item.body_html);

        return (
            <div
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
    }).isRequired,
};