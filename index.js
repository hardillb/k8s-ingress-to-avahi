const KubeConfig = require('kubernetes-client').KubeConfig
const Client = require('kubernetes-client').Client
const JSONStream = require('json-stream')

const kubeconfig = new KubeConfig()

const configPath = process.argv[2] || '~/.kube/config'

kubeconfig.loadFromFile(configPath)
const Request = require('kubernetes-client/backends/request')
const backend = new Request({ kubeconfig })
const client = new Client({ backend, version: '1.13' })

const dbus = require('dbus-next');
const bus = dbus.systemBus()

const hostname = process.argv[3]
const namespace = process.argv[4] || "default"

const cnames = {}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)

function cleanup() {
	const keys = Object.keys(cnames)
	for (k in keys) {
		//console.log(keys[k])
		cnames[keys[k]].Reset()
    	cnames[keys[k]].Free()
	}
	bus.disconnect()
	process.exit(0)
}

function encodingLength(n) {
  if (n === '.') return 1
  return Buffer.byteLength(n) + 2
}

function encodeFQDN(name) {
	let buf = Buffer.allocUnsafe(encodingLength(name))

	let offset = 0
	let parts = name.split('.')
	for (let i = 0; i < parts.length; i++) {
		const length = buf.write(parts[i],offset + 1)
		buf[offset] = length
		offset += length + 1
	}

	buf[offset++] = 0
	return buf
}

function main() {

	let server;

	bus.getProxyObject('org.freedesktop.Avahi', '/')
	.then( async obj => {
		server = obj.getInterface('org.freedesktop.Avahi.Server')
	})

	const stream = client.apis.extensions.v1beta1.namespaces(namespace).ingresses.getStream({qs:{ watch: true}})

	const jsonStream = new JSONStream()
	stream.pipe(jsonStream)
	jsonStream.on('data', async obj => {
	    //console.log('Event: ', JSON.stringify(obj, null ,2))
	    if (obj.type == "ADDED") {
	    	for (x in obj.object.spec.rules) {
	    		const host = obj.object.spec.rules[x].host
	    		console.log("Adding: ", host)

	    		if (!cnames[host]) {
		    		let entryGroupPath = await server.EntryGroupNew()
		    		let entryGroup = await bus.getProxyObject('org.freedesktop.Avahi',  entryGroupPath)
		    		let entryGroupInt = entryGroup.getInterface('org.freedesktop.Avahi.EntryGroup')

					var interface = -1
					var protocol = -1
					var flags = 0
					var name = host
					var clazz = 0x01
					var type = 0x05
					var ttl = 60
					var rdata = encodeFQDN(hostname)

					entryGroupInt.AddRecord(interface, protocol, flags, name, clazz, type, ttl, rdata)

					entryGroupInt.Commit()
					.then(()=>{
						cnames[host] = entryGroupInt
					})
				}
	    	}
	    } else if (obj.type == "DELETED") {
	    	for (x in obj.object.spec.rules) {
	    		console.log("Removing: ", obj.object.spec.rules[x].host)
	    		const host = obj.object.spec.rules[x].host
	    		if (cname[host]) {
		    		cnames[obj.object.spec.rules[x].host].Reset()
		    		cnames[obj.object.spec.rules[x].host].Free()
		    		delete cnames[obj.object.spec.rules[x].host]
		    	}
	    	}
	    }
		// console.log(cnames);
	})
}

main()
