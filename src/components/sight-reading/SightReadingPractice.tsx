

import { useSightReadingConfig } from './SightReadingConfigContext';


export default function SightReadingPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    /** Configuration for this exercise */
    const sightReadingConfig = useSightReadingConfig();

    return (
        <>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumbs">
                <button className="breadcrumb" onClick={ goHome }>Home</button>&gt;
                <button className="breadcrumb" onClick={ goToConfig }>Configuration</button>&gt;
                <span className="breadcrumb">Practice</span>
            </nav>

        </>
    );
}
