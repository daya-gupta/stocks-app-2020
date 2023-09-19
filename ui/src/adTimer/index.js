import React, { useEffect, useState } from 'react';

const maxRemainingSeconds = 5;

const AdTimer = () => {
    const [ remainingSeconds, setRemainingSeconds ] = useState();
    const [ adStatus, setAdStatus ] = useState(false);

    const skipAd = () => {
        // remove add section
        setAdStatus(false);
    }

    // const callback = () => {
    //     setRemainingSeconds(remainingSeconds - 1);
    // }

    const configureTimer = () => {
        let remaining = maxRemainingSeconds;
        setRemainingSeconds(remaining);
        setAdStatus(true);
        const timerRef = setInterval(() => {
            --remaining
            if (remaining === 0) {
                clearInterval(timerRef);
            }
            setRemainingSeconds(remaining);
        }, 1000);
    }

    useEffect(configureTimer, []);

    return (
        <div>
            <div style={{ width: '800px', height: '500px', background: '#eee', border: '4px solid #aaa', position: 'relative' }}>
                {/* add the skip message in bottom of screen */}
                {adStatus && (
                    <button
                        disabled={remainingSeconds !== 0}
                        style={{ position: 'absolute', bottom: '5px', right: '5px' }}
                        onClick={skipAd}
                    >
                        <span>
                            <span>Skip</span>
                            {!!remainingSeconds && <span>&nbsp;in {remainingSeconds} seconds</span>}
                        </span>
                    </button>
                )}
            </div>

            {/* reset button */}
            <button
                disabled={adStatus}
                // style={{ position: 'absolute', bottom: '5px', right: '5px' }}
                onClick={configureTimer}
            >
                Restart timer
            </button>

        </div>
    );
};

export default AdTimer;