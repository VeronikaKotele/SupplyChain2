import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { useRef, useEffect, useState } from 'react';
import './PowerBIDashboard.css';

interface PowerBIDashboardProps {
  embedUrl: string;
  onFiltersChange?: (filters: any) => void;
}

function PowerBIDashboard({ embedUrl, onFiltersChange }: PowerBIDashboardProps) {
  // For public embeds, extract the token which serves as the ID
  const urlParams = new URLSearchParams(embedUrl.split('?')[1]);
  const reportToken = urlParams.get('r') || '';
  const reportRef = useRef<any>(null);
  const [testFilterValue, setTestFilterValue] = useState('');

  // Function to test applying filters programmatically
  const testApplyFilter = async () => {
    if (!reportRef.current) {
      console.log('❌ Report not loaded yet');
      return;
    }

    console.log('🧪 Testing filter application...');
    
    try {
      // Try to get pages
      const pages = await reportRef.current.getPages();
      console.log('✅ Got pages:', pages.length);
      
      const activePage = pages.find((p: any) => p.isActive);
      if (!activePage) {
        console.log('❌ No active page found');
        return;
      }
      
      console.log('✅ Active page:', activePage.displayName);
      
      // Try to get visuals
      const visuals = await activePage.getVisuals();
      console.log('✅ Got visuals:', visuals.length);
      
      // Try to get current filters
      const currentFilters = await activePage.getFilters();
      console.log('✅ Current filters:', currentFilters);
      
      // Try to apply a test filter (example - you'll need to adjust based on your data)
      const testFilter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
          table: "YourTableName", // Replace with actual table name
          column: "YourColumnName" // Replace with actual column name
        },
        operator: "In",
        values: [testFilterValue],
        filterType: models.FilterType.Basic
      };
      
      console.log('🔧 Attempting to apply filter:', testFilter);
      await activePage.setFilters([testFilter]);
      console.log('✅ Filter applied successfully!');
      
    } catch (err: any) {
      console.error('❌ Error testing filter:', err);
      console.log('📝 Error details:', err.message);
    }
  };

  useEffect(() => {
    // Listen for postMessage events from the Power BI iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin.includes('powerbi.com')) {
        console.log('📬 Message from Power BI iframe:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="powerbi-container">
      <PowerBIEmbed
        embedConfig={{
          type: 'report',
          id: reportToken,
          embedUrl: embedUrl,
          accessToken: reportToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: {
                expanded: false,
                visible: true
              }
            },
            background: models.BackgroundType.Transparent,
            filterPaneEnabled: true,
            navContentPaneEnabled: true
          }
        }}
        eventHandlers={
          new Map([
            ['loaded', (event) => { 
              console.log('✅ Report loaded', event?.detail); 
            }],
            ['rendered', (event) => { 
              console.log('✅ Report rendered', event?.detail); 
            }],
            ['error', (event) => { 
              console.error('❌ Power BI Error:', event?.detail); 
            }]
          ])
        }
        cssClassName="powerbi-embed"
        getEmbeddedComponent={(embeddedReport) => {
          console.log('🎯 Power BI embedded component loaded');
          reportRef.current = embeddedReport;
          
          if (embeddedReport) {
            // Try to register the filtersApplied event
            embeddedReport.on('filtersApplied', (event: any) => {
              console.log('🔍 *** FILTERS APPLIED EVENT ***:', event);
              if (onFiltersChange) {
                onFiltersChange(event);
              }
            });
          }
        }}
      />
    </div>
  );
}

export default PowerBIDashboard;
