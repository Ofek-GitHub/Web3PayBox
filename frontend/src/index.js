import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {configureChains, mainnet, WagmiConfig, createClient} from "wagmi";
import {publicProvider} from "wagmi/providers/public";
import {polygonMumbai} from '@wagmi/chains';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

const {provider, webSocketProvider} = configureChains(
    [mainnet, polygonMumbai],
    [publicProvider()]
);

const client = createClient({
    autoConnect: true,
    provider,
    webSocketProvider,
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <WagmiConfig client={client}>
            <DevSupport ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}
            >
                <App/>
            </DevSupport>
        </WagmiConfig>
    </React.StrictMode>
);
