import { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Mesh,
  TransformNode,
  LinesMesh,
} from '@babylonjs/core';
import type { EarthModelProps } from './interfaces/EarthModelProps';
import { translateToCompanyMarker, type CompanyMarker } from './interfaces/CompanyMarker';
import { translateToConnectionMarker } from './interfaces/ConnectionMarker';
import { createCompanyMarkers, disposeCompanyMarkers } from './sceneBuilder/companyMarkersBuilder';
import { createConnectionLines, disposeConnectionLines } from './sceneBuilder/connectionMarkerBuilder';
import type { Company, Connection, ColorLegendOption } from '@app/types';
import { useScenePickerWhenNoDragging } from './inputHandler/mouseClicksController';
import { useSceneComposer } from './sceneBuilder/sceneComposer';
import { selectClosestPoint } from './utils/math3D';
import SelectedCompanyInfo from './SelectedCompanyInfo';

interface EarthViewerProps {
  earthModelProps: EarthModelProps;
  companies?: Company[];
  connections?: Connection[];
  companyTypeColors?: ColorLegendOption[];
}

const EarthViewer: React.FC<EarthViewerProps> = ({ 
  earthModelProps,
  companies = [],
  connections = [],
  companyTypeColors = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const earthParentRef = useRef<TransformNode | null>(null);
  const allCompanyPositionsRef = useRef<Map<string, Vector3>>(new Map()); // Complete positions map
  const companiesPointCloudRef = useRef<Mesh[]>([]);
  const connectionLinesRef = useRef<LinesMesh[]>([]);
  const animationRef = useRef<any>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyMarker | null>(null);

  // create the earth mesh and scene
  useEffect(() => {
    useSceneComposer(
      canvasRef,
      engineRef,
      sceneRef,
      cameraRef,
      earthParentRef,
      animationRef,
      pauseTimeoutRef,
      earthModelProps
    );
  }, [earthModelProps]);

  // Update companies markers when companies prop changes - with progressive rendering
  useEffect(() => {
    if (!sceneRef.current) return;
    if (companies.length === 0) return; // Don't process empty entities array

    const scene = sceneRef.current;
    const earthParent = earthParentRef.current;

    // Clear existing markers
    disposeCompanyMarkers(companiesPointCloudRef.current);
    companiesPointCloudRef.current = [];

    // Translate companies to CompanyMarker format
    const companyMarkers: CompanyMarker[] = [];
    companies.forEach(companyInfo => {
      const marker = translateToCompanyMarker(companyInfo, earthModelProps.radius, companyTypeColors);
      companyMarkers.push(marker);

      //update complete positions map
      allCompanyPositionsRef.current.set(marker.id, marker.position);
    });

    // Create new markers using the utility
    const { meshes, cancel } = createCompanyMarkers(
      companyMarkers,
      scene,
      earthParent || undefined
    );
    
    companiesPointCloudRef.current = meshes;

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancel();
    };
  }, [companies, earthModelProps.radius, companyTypeColors]);

  // Update connection lines when connections prop changes - with progressive rendering
  useEffect(() => {
    if (!sceneRef.current) return;
    if (connections.length === 0) return;

    const scene = sceneRef.current;
    const earthParent = earthParentRef.current;

    // Clear existing connection lines
    disposeConnectionLines(connectionLinesRef.current);
    connectionLinesRef.current = [];

    // Create new connection lines using the utility with complete positions map
    const { meshes, cancel } = createConnectionLines(
      connections.map(c => translateToConnectionMarker(c, allCompanyPositionsRef.current)),
      scene,
      earthParent
    );
    
    connectionLinesRef.current = meshes;

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancel();
    };
  }, [connections]);

  useScenePickerWhenNoDragging(sceneRef, (pickedPoint) => {
    setSelectedCompany(selectClosestPoint(
      pickedPoint,
      companies,
      allCompanyPositionsRef.current));
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          outline: 'none',
        }}
      />
      {selectedCompany && (
        <SelectedCompanyInfo
          selectedMarker={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};

export default EarthViewer;
