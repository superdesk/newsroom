import React from 'react';
import Modal from 'components/Modal';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

export default class ItemStatisticsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {loading: true, iframe: null};
    }

    componentDidMount() {
        this.fetchState();
    }

    fetchState() {
        const {item} = this.props.data;
        const guid = item.extra && item.extra.newsItem_guid;

        if (guid == null || !guid.includes(':')) {
            this.setState({loading: false});
        }

        const pieces = guid.split(':');
        const id = pieces[pieces.length - 1];
        
        fetch('https://56dtrivaof.execute-api.eu-north-1.amazonaws.com/production/api/v1/embed?organization=stt&versionId=' + id)
            .then((res) => res.json())
            .then((data) => {
                this.setState({iframe: data.iframeSrc});
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                this.setState({loading: false});
            });
    }

    render() {
        if (this.state.loading) {
            return null;
        }

        return (
            <Modal
                title={gettext('Article Statistics')}
                width={'full'}
            >
                {this.state.iframe == null && (
                    <h3>{gettext('There are no statistics available for selected item.')}</h3>
                )}
                {this.state.iframe != null && (
                    <iframe src={this.state.iframe}></iframe>
                )}
            </Modal>
        );
    }
}

ItemStatisticsModal.propTypes = {
    data: PropTypes.shape({
        item: PropTypes.shape({
            extra: PropTypes.shape({
                newsItem_guid: PropTypes.string,
            }),
        }),
    }),
};