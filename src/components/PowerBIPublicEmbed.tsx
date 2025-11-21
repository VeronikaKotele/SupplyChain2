import './PowerBIDashboard.css';

interface PowerBIPublicEmbedProps {
  embedUrl: string;
}

function PowerBIPublicEmbed({ embedUrl }: PowerBIPublicEmbedProps) {
  return (
    <div className="powerbi-container">
      <iframe
        title="Power BI Report"
        src={embedUrl}
        className="powerbi-embed"
        allowFullScreen={true}
      />
    </div>
  );
}

export default PowerBIPublicEmbed;
