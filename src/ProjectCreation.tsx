import * as React from 'react'
import {Dialog, DialogTitle, TextField, Button} from '@mui/material'
import {Catalog, CONSOLID} from 'consolid-daapi'
import {ReferenceRegistry} from 'consolid-raapi'
import { PiletApi } from 'consolid-shell';
import {v4} from 'uuid'
const {RDF, DCAT, DCTERMS, RDFS} = require('@inrupt/vocab-common-rdf')


export interface SimpleDialogProps {
  open: boolean;
  piral: PiletApi;
  onClose: () => void;
}

export default function ProjectDialog(props: SimpleDialogProps) {
  const { onClose, open, piral } = props;
  const [label, setLabel] = React.useState("MyFirstProject")
  const constants = piral.getData("CONSTANTS")


  async function createNewProject() {
    const session = piral.makeSession()

    const webId = session.info.webId
    const root = webId.replace('profile/card#me', '')
    const projectId = v4()
    const projectUrl = root + projectId
    const project:any = new Catalog(session, projectUrl)

    const metadata = [{
        predicate: RDF.type,
        object: CONSOLID.Project
    }, {
        predicate: RDFS.label,
        object: label
    }]
    await project.create(true, metadata)
    const refRegUrl = root + v4()
    const referenceRegistry = new ReferenceRegistry(session, refRegUrl)
    await referenceRegistry.create(project, true)

}

  return (
    <Dialog style={{margin: 30}} onClose={() => onClose()} open={open}>
      <DialogTitle>Create Project</DialogTitle>
      <TextField placeholder="A name for the project" value={label} onChange={(e) => setLabel(e.target.value)}/>
      <Button onClick={createNewProject}>Create project</Button>
    </Dialog>
  );
}
