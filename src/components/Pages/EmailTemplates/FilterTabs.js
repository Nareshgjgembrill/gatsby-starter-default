import React, { useEffect, useState } from 'react';
import { ButtonGroup } from 'reactstrap';

import FilterButton from '../../Common/FilterButton';

const FilterTabs = ({ history, activeTabValue, countData, loading, error }) => {
  const [activeTab, setActiveTab] = useState(activeTabValue);
  const [templateCount, setTemplateCount] = useState(null);
  const [snippetsCount, setSnippetsCount] = useState(null);

  useEffect(() => {
    if (countData) {
      setTemplateCount(countData?.templates?.paging?.totalCount);
      setSnippetsCount(countData?.snippets?.paging?.totalCount);
    }
  }, [countData]);

  const handleTemplatesTabChange = (e) => {
    e.preventDefault();

    const tabValue = e.currentTarget.getAttribute('value');

    setActiveTab(tabValue);
  };

  return (
    <ButtonGroup>
      <FilterButton
        active={activeTab === 'Templates'}
        value={'Templates'}
        count={templateCount}
        countError={error}
        countLoading={templateCount === null && loading}
        handleClick={handleTemplatesTabChange}
        history={history}
        to="/templates"
        title="All Email Templates"
        className={`${
          activeTab === 'Templates' && 'bg-color-primary-shade text-white'
        }`}
      >
        <strong>Email Templates</strong>
      </FilterButton>
      <FilterButton
        active={activeTab === 'Snippets'}
        value={'Snippets'}
        count={snippetsCount}
        countError={error}
        countLoading={snippetsCount === null && loading}
        handleClick={handleTemplatesTabChange}
        history={history}
        to="/templates/snippets"
        title="All Snippets"
        className={`${
          activeTab === 'Snippets' && 'bg-color-primary-shade text-white'
        }`}
      >
        <strong>Snippets</strong>
      </FilterButton>
    </ButtonGroup>
  );
};

export default FilterTabs;
