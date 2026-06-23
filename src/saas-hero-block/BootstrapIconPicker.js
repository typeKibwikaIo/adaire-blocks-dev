import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { Modal, TextControl, Button } from '@wordpress/components';
import { icons } from '../icon-box-block/bootstrapIcons';

const ICONS_PER_PAGE = 48; // Number of icons to show per page

export default function BootstrapIconPicker({ isOpen, onClose, onSelect, currentIcon }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter icons based on search query
    const filteredIcons = useMemo(() => {
        if (!searchQuery.trim()) {
            return icons;
        }
        const query = searchQuery.toLowerCase();
        return icons.filter(icon =>
            icon.icon.toLowerCase().includes(query) ||
            icon.class.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);
    const startIndex = (currentPage - 1) * ICONS_PER_PAGE;
    const endIndex = startIndex + ICONS_PER_PAGE;
    const currentIcons = filteredIcons.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Handle icon selection
    const handleIconSelect = (icon) => {
        onSelect(icon.class);
        onClose();
    };

    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToPrevious = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const goToNext = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    if (!isOpen) return null;

    return (
        <Modal
            title={__('Select Icon', 'saas-hero-block')}
            onRequestClose={onClose}
            className="adaire-bootstrap-icon-picker"
            style={{ maxWidth: '900px' }}
        >
            <div className="adaire-bootstrap-icon-picker__content">
                {/* Search */}
                <div className="adaire-bootstrap-icon-picker__search">
                    <TextControl
                        placeholder={__('Search icons...', 'saas-hero-block')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <div className="adaire-bootstrap-icon-picker__count">
                        {filteredIcons.length} {__('icon(s) found', 'saas-hero-block')}
                    </div>
                </div>

                {/* Icons Grid */}
                <div className="adaire-bootstrap-icon-picker__grid">
                    {currentIcons.length > 0 ? (
                        currentIcons.map((icon, index) => (
                            <button
                                key={`${icon.class}-${index}`}
                                className={`adaire-bootstrap-icon-picker__item ${currentIcon === icon.class ? 'is-selected' : ''
                                    }`}
                                onClick={() => handleIconSelect(icon)}
                                title={icon.icon}
                                aria-label={icon.icon}
                            >
                                <i className={icon.class}></i>
                                <span className="adaire-bootstrap-icon-picker__label">
                                    {icon.icon}
                                </span>
                                <span className="adaire-bootstrap-icon-picker__class">
                                    {icon.class}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div className="adaire-bootstrap-icon-picker__empty">
                            <p>{__('No icons found', 'saas-hero-block')}</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="adaire-bootstrap-icon-picker__pagination">
                        <Button
                            onClick={goToPrevious}
                            disabled={currentPage === 1}
                            variant="secondary"
                        >
                            {__('Previous', 'saas-hero-block')}
                        </Button>

                        <div className="adaire-bootstrap-icon-picker__page-info">
                            {__('Page', 'saas-hero-block')} {currentPage} {__('of', 'saas-hero-block')} {totalPages}
                            {totalPages > 5 && (
                                <div className="adaire-bootstrap-icon-picker__page-jump">
                                    <TextControl
                                        type="number"
                                        min={1}
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(value) => {
                                            const page = parseInt(value);
                                            if (page >= 1 && page <= totalPages) {
                                                goToPage(page);
                                            }
                                        }}
                                        style={{ width: '60px', marginLeft: '8px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={goToNext}
                            disabled={currentPage === totalPages}
                            variant="secondary"
                        >
                            {__('Next', 'saas-hero-block')}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
