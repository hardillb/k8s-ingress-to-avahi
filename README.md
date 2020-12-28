# k8s-ingress-to-avahi

A quick and dirty hack to turn Ingress hostnames into mDNS CNAME entries

## Running

The script take 2 arguments

 - The path to the kubctl config file
 - The mDNS hostname of the Ingress machine

 e.g.

 ```
 $ node index.js /home/ubuntu/.kube/config ubuntu.local
 ```



## No HTTPS support

Might add this later, but would require custom Certificate Authority to 
issue certs for `.local` domain.