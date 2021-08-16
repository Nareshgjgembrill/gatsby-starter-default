import React from 'react';
// Need to import customized ckeditor in the following location /Common/ckeditor/CkEditor
import CKEditor from 'ckeditor4-react';

export const CkEditor = ({ data, onChange }) => {
  return (
    <div style={{ overflow: 'auto' }}>
      {/* Need to import customized ckeditor in the following location /Common/ckeditor/CkEditor */}
      <CKEditor data={data} onChange={onChange} />
    </div>
  );
};
