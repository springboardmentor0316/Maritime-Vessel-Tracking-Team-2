import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import { VESSEL_TYPE_LABELS, VESSEL_STATUS_LABELS } from '../../constants';
import { formatCoordinates, formatSpeed } from '../../utils/helpers';
import './VesselCard.css';

const VesselCard = ({ vessel }) => {
  const navigate = useNavigate();

  const getStatusBadgeType = (status) => {
    const types = {
      active: 'success',
      underway: 'primary',
      anchored: 'warning',
      moored: 'info',
      inactive: 'default',
    };
    return types[status] || 'default';
  };

  return (
    <div
      className="vessel-card"
      onClick={() => navigate(`/vessels/${vessel.id}`)}
    >
      <div className="vessel-card-header">
        <h3 className="vessel-card-title">{vessel.name}</h3>
        <Badge
          text={VESSEL_STATUS_LABELS[vessel.status]}
          type={getStatusBadgeType(vessel.status)}
        />
      </div>

      <div className="vessel-card-body">
        <div className="vessel-info-row">
          <span className="label">Type:</span>
          <span className="value">{VESSEL_TYPE_LABELS[vessel.type]}</span>
        </div>
        <div className="vessel-info-row">
          <span className="label">IMO:</span>
          <span className="value">{vessel.imo}</span>
        </div>
        <div className="vessel-info-row">
          <span className="label">MMSI:</span>
          <span className="value">{vessel.mmsi}</span>
        </div>
        <div className="vessel-info-row">
          <span className="label">Flag:</span>
          <span className="value">{vessel.flag}</span>
        </div>
        {vessel.latitude && vessel.longitude && (
          <>
            <div className="vessel-info-row">
              <span className="label">Position:</span>
              <span className="value">
                {formatCoordinates(vessel.latitude, vessel.longitude)}
              </span>
            </div>
            {vessel.speed && (
              <div className="vessel-info-row">
                <span className="label">Speed:</span>
                <span className="value">{formatSpeed(vessel.speed)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VesselCard;