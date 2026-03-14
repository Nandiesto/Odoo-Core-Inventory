import React from 'react';
import { GlassCard } from '@mawtech/glass-ui';

import profilePlaceholder from '../assets/profile-placeholder.png'; // Will create a dummy img

export const DemoGlassCard = () => {
    return (
        <div className="demo-glass-card">
            <GlassCard
                blur={10}
                distortion={20}
                flexibility={0}
                borderColor="#ffffff"
                borderSize={1}
                borderRadius={24}
                borderOpacity={0.15}
                backgroundColor="#000000"
                backgroundOpacity={0.4}
                innerLightColor="#ffffff"
                innerLightSpread={1}
                innerLightBlur={10}
                innerLightOpacity={0.05}
                outerLightColor="#ffffff"
                outerLightSpread={1}
                outerLightBlur={20}
                outerLightOpacity={0.05}
                color="#ffffff"
                chromaticAberration={0}
                onHoverScale={1.02}
                saturation={110}
                brightness={100}
            >
                <div className="profile-card">
                    <div className="profile-image-container">
                        <div className="profile-image-placeholder">AF</div>
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">Admin User</div>
                        <div className="profile-role">Inventory Manager</div>
                        <div className="profile-actions">
                            <button className="profile-button primary">Dashboard</button>
                            <button className="profile-button">Settings</button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
