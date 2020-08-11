import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { formatHTML } from 'utils';
import {connect} from 'react-redux';
import { selectCopy } from '../../wire/actions';

/**
 * using component to fix iframely loading
 * https://iframely.com/docs/reactjs
 */
class ArticleBodyHtml extends React.PureComponent {
    constructor(props) {
        super(props);
        this.copyClicked = this.copyClicked.bind(this);
    }

    componentDidMount() {
        this.loadIframely();
        document.addEventListener('copy', this.copyClicked);
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

    copyClicked() {
        this.props.reportCopy(this.props.item);
    }

    componentWillUnmount() {
        document.removeEventListener('copy', this.copyClicked);
    }

    render() {
        const item = this.props.item;

        if (!item.body_html) {
            return null;
        }

        const esHighlightedItem = get(item, 'es_highlight.body_html.length', 0) > 0 ? 
            {
                ...item,
                body_html: item.es_highlight.body_html[0]
            } : item;
        const html = formatHTML(esHighlightedItem.body_html);

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
    reportCopy: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
    reportCopy: (item) => dispatch(selectCopy(item))
});

export default connect(null, mapDispatchToProps)(ArticleBodyHtml);
