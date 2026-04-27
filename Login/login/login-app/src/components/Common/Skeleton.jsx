import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type }) => {
    if (type === 'card') {
        return (
            <div className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-info">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line text"></div>
                    <div className="skeleton-line short"></div>
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="skeleton-list-item">
                <div className="skeleton-circle"></div>
                <div className="skeleton-content">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line text"></div>
                </div>
            </div>
        );
    }

    return <div className="skeleton-base"></div>;
};

export default Skeleton;
