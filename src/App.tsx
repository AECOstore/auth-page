import * as React from 'react'
import { TextField, Button, Grid, Box, Dialog, useMediaQuery, DialogTitle, DialogContent, Alert } from '@mui/material'
import { PiletApi } from 'consolid-shell'
import { v4 } from 'uuid'
import { generateDpopKeyPair } from '@inrupt/solid-client-authn-core';
import Cookies from 'universal-cookie';
import jwt_decode from 'jwt-decode'
const cookies = new Cookies()

async function generateAccessToken(email: string, password: string, idp: string): Promise<any> {
    if (!idp.endsWith("/")) idp += '/'
    const response = await fetch(`${idp}idp/credentials/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name: v4() }),
    });

    const { id, secret } = await response.json();
    const tokenUrl = `${idp}.oidc/token`;
    const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
    const dpopKey = await generateDpopKeyPair();
    const r = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            // dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
        },
        body: 'grant_type=client_credentials&scope=webid',
    });
    const { access_token } = await r.json();
    return { token: access_token, dpop: dpopKey }
}

const App = ({ piral }: { piral: PiletApi }) => {
    const constants = piral.getData("CONSTANTS")
    const [oidcIssuer, setOidcIssuer] = React.useState("http://localhost:3000");
    const [email, setEmail] = React.useState("architect@example.org");
    const [password, setPassword] = React.useState("test123");
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(undefined)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)

    // check if logged in at initialisation
    React.useEffect(() => {
        let token = cookies.get(constants.ACCESS_TOKEN)
        if (token && token !== "undefined") {
            const webId = jwt_decode<any>(token).webid
            console.log('webId', webId)
            piral.findSparqlSatellite(webId).then(satellite => {
                console.log('satellite', satellite)
                piral.setData(constants.SPARQL_ENDPOINT, satellite)
                piral.setData(constants.USER_WEBID, webId)
                setIsLoggedIn(webId)
            })
        } else {
            setIsLoggedIn(false)
        }
    }, [])

    const onLoginClick = async (e) => {
        try {
            setLoading(e => true)
            const { token } = await generateAccessToken(email, password, oidcIssuer)
            cookies.set(constants.ACCESS_TOKEN, token)
            // piral.setData(constants.ACCESS_TOKEN, token)

            if (token) {
                const webId = jwt_decode<any>(cookies.get(constants.ACCESS_TOKEN)).webid
                setIsLoggedIn(webId)
            } else {
                setIsLoggedIn(false)
            }
            setLoading(e => false)
        } catch (error) {
            setError(error.message)
            setLoading(e => false)
        }
    };

    const onLogoutClick = async (e) => {
        try {
            setLoading(e => true)
            cookies.set(constants.ACCESS_TOKEN, undefined)
            // piral.setData(constants.ACCESS_TOKEN, undefined)
            // piral.setData(constants.USER_WEBID, undefined)
            // piral.setData(constants.SPARQL_ENDPOINT, undefined)
            setIsLoggedIn(false)
            setLoading(e => false)
        } catch (error) {
            setError(error.message)
            setLoading(e => false)
        }
    };

    return (
        <div style={{ alignContent: "center", padding: 30, alignItems: "center", justifyContent: "center", marginTop: "100px", textAlign: "center" }}>
            {(!isLoggedIn) ? (
                <div>
                    <h1 style={{ marginBottom: "30px" }}>Log in with Solid</h1>
                    <TextField
                        style={inputStyle}
                        id="oidcIssuer"
                        label="Solid Identity Provider"
                        placeholder="Identity Provider"
                        defaultValue={oidcIssuer}
                        onChange={(e) => setOidcIssuer(e.target.value)}
                        autoFocus
                        fullWidth
                    />
                    <TextField
                        style={inputStyle}
                        id="email"
                        label="Email"
                        placeholder="Email"
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        style={inputStyle}
                        id="password"
                        label="Password"
                        placeholder="Password"
                        defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        type="password"
                        fullWidth
                    />

                    <Button style={buttonStyle} onClick={onLoginClick} disabled={loading} variant="contained" color="primary">
                        Log In
                    </Button>
                    {(error) ? (
                        <Alert style={{ margin: 5 }} onClose={() => setError("")} severity="error">{error}</Alert>
                    ) : (
                        <></>
                    )}
                </div>
            ) : (
                <div>
                    <h1 style={{ marginBottom: "30px" }}>Log out</h1>
                    <Button style={buttonStyle} onClick={onLogoutClick} disabled={loading} variant="contained" color="primary">
                        Log out
                    </Button>
                </div>
            )}
        </div>
    )
}

const inputStyle = {
    marginTop: 15
}

const buttonStyle = {
    display: "flex",
    marginTop: 15,
    width: "100%"
}

export default App