const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kira', {
  loadData:    ()       => ipcRenderer.invoke('load-data'),
  saveData:    (data)   => ipcRenderer.invoke('save-data', data),
  setExpanded: (flag)   => ipcRenderer.invoke('set-expanded', flag),
  chat:        (opts)   => ipcRenderer.invoke('chat', opts),
})
