# k8s-ingress-to-avahi

A quick and dirty hack to turn Ingress hostnames into mDNS CNAME entries

## Install

```
$ git clone https://github.com/hardillb/k8s-ingress-to-avahi.git
$ cd k8s-ingress-to-avahi
$ npm install
```

## Running

This runs on the Ingress Host machine outside of Kubernetes (might be able to get it to work in a container,
but will need the DBUS socket mounting into the container)

The script take 2 arguments

 - The path to the kubctl config file
 - The mDNS hostname of the Ingress machine

 e.g.

 ```
 $ node index.js /home/ubuntu/.kube/config ubuntu.local
 ```

The Ingress YAML should look something like this:

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: manager-ingress
spec:
  rules:
  - host: "manager.ubuntu.local"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: manager
            port:
              number: 3000 
```


## No HTTPS support

Might add this later, but it would require custom Certificate Authority to 
issue certs for `.local` domain.
