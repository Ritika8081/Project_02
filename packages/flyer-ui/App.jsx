import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const FLYER_FIELDS = [
  'Property_Description',
  'Property_Highlights_line-1',
  'Property_Highlights_line-2',
  'Property_Highlights_line-3',
  'Property_Highlights_line-4',
  'Property_Highlights_line-5',
  'Property_Highlights_line-6',
  'Property_Location',
  'Take_away_Text',
  'CTA',
  'Image_1',
  'Image_2',
  'Image_3',
];

export default function App() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [params, setParams] = useState({});
  const [flyerHtml, setFlyerHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/flyer-templates`).then(r => setTemplates(r.data));
  }, []);

  const handleSelect = (tpl) => {
    setSelected(tpl);
    setParams({});
    setFlyerHtml('');
  };

  const handleChange = (field, value) => {
    setParams(p => ({ ...p, [field]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    const usedFields = (selected.placeholders || FLYER_FIELDS).filter(f => f in params || f.startsWith('Image_'));
    const filled = {};
    usedFields.forEach(f => filled[f] = params[f] || '');
    const res = await axios.post(`${API_BASE}/generate-flyer`, {
      templateId: selected.id,
      params: filled,
    });
    setFlyerHtml(res.data);
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Arial', background: '#f7f7f7', minHeight: '100vh', padding: 32 }}>
      <h1>Flyer Generator</h1>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <h2>Choose a Template</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            {templates.map(tpl => (
              <div key={tpl.id} style={{ border: selected?.id === tpl.id ? '2px solid #1976d2' : '1px solid #ccc', borderRadius: 8, padding: 8, cursor: 'pointer', background: '#fff' }} onClick={() => handleSelect(tpl)}>
                <img src={tpl.preview || ''} alt={tpl.name} style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 6 }} />
                <div style={{ fontWeight: 'bold', marginTop: 8 }}>{tpl.name}</div>
                <div style={{ fontSize: 12 }}>{tpl.description}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 2 }}>
          {selected && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #ccc' }}>
              <h2>Enter Flyer Details</h2>
              <form onSubmit={e => { e.preventDefault(); handleGenerate(); }}>
                {(selected.placeholders || FLYER_FIELDS).map(field => (
                  field.startsWith('Image_') ? (
                    <div key={field} style={{ marginBottom: 12 }}>
                      <label>{field.replace('_', ' ')}: </label>
                      <input type="text" placeholder="Image URL" value={params[field] || ''} onChange={e => handleChange(field, e.target.value)} style={{ width: 300 }} />
                    </div>
                  ) : (
                    <div key={field} style={{ marginBottom: 12 }}>
                      <label>{field.replace(/_/g, ' ')}: </label>
                      <input type="text" value={params[field] || ''} onChange={e => handleChange(field, e.target.value)} style={{ width: 400 }} />
                    </div>
                  )
                ))}
                <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '8px 24px', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Generate Flyer</button>
              </form>
            </div>
          )}
        </div>
      </div>
      {flyerHtml && (
        <div style={{ marginTop: 40, background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #ccc' }}>
          <h2>Flyer Preview</h2>
          <div dangerouslySetInnerHTML={{ __html: flyerHtml }} />
        </div>
      )}
    </div>
  );
}
