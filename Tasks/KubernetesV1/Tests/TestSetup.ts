import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');
import * as shared from './TestShared';
const querystring = require("querystring");

var nock = require("nock");
var Stats = require('fs').Stats;

const DefaultWorkingDirectory: string = shared.formatPath("a/w");
const ConfigurationFilePath = shared.formatPath("dir/deployment.yaml");
const newUserDirPath = shared.formatPath("newUserDir/");
const KubconfigFile = shared.formatPath("newUserDir/config");
const KubectlPath = shared.formatPath("newUserDir/kubectl.exe");
const ConfigMapFilePath = shared.formatPath("configMapDir/configmap.properties");
const ConfigMapDirectoryPath = shared.formatPath("kubernetes/configMapDir");

let taskPath = path.join(__dirname, '../src', 'kubernetes.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tr.setInput('containerregistrytype', process.env[shared.TestEnvVars.containerType] || shared.ContainerTypes.ContainerRegistry);
tr.setInput('connectionType', process.env[shared.TestEnvVars.connectionType] || shared.ConnectionType.AzureResourceManager);
tr.setInput('command', process.env[shared.TestEnvVars.command] || shared.Commands.apply);
tr.setInput('useConfigurationFile', process.env[shared.TestEnvVars.useConfigurationFile] || "false");
tr.setInput('configuration', ConfigurationFilePath);
tr.setInput('arguments', process.env[shared.TestEnvVars.arguments] || '');
tr.setInput('namespace', process.env[shared.TestEnvVars.namespace] || '');
tr.setInput('secretType', process.env[shared.TestEnvVars.secretType] || 'dockerRegistry');
tr.setInput('secretArguments', process.env[shared.TestEnvVars.secretArguments] || '');
tr.setInput('secretName', process.env[shared.TestEnvVars.secretName] || '');
tr.setInput('forceUpdate', process.env[shared.TestEnvVars.forceUpdate] || "true");
tr.setInput('configMapName', process.env[shared.TestEnvVars.configMapName] || '');
tr.setInput('forceUpdateConfigMap', process.env[shared.TestEnvVars.forceUpdateConfigMap] || "false");
tr.setInput('useConfigMapFile', process.env[shared.TestEnvVars.useConfigMapFile] || "false");
tr.setInput('configMapFile', process.env[shared.TestEnvVars.configMapFile] || ConfigMapFilePath);
tr.setInput('configMapArguments', process.env[shared.TestEnvVars.configMapArguments] || '');
tr.setInput('versionOrLocation', process.env[shared.TestEnvVars.versionOrLocation] || 'version');
tr.setInput('versionSpec', process.env[shared.TestEnvVars.versionSpec] || "1.7.0");
tr.setInput('checkLatest', process.env[shared.TestEnvVars.checkLatest] || "false");
tr.setInput('specifyLocation', process.env[shared.TestEnvVars.specifyLocation] || "");
tr.setInput('outputFormat', process.env[shared.TestEnvVars.outputFormat] || 'json');
tr.setInput('dockerRegistryEndpoint', 'dockerhubendpoint');
tr.setInput('kubernetesServiceEndpoint', 'kubernetesEndpoint');
tr.setInput('azureSubscriptionEndpoint', 'AzureRMSpn');
tr.setInput('azureSubscriptionEndpoint2', 'AzureRMSpn');
tr.setInput('azureContainerRegistry', 'ajgtestacr1.azurecr.io');
tr.setInput('azureResourceGroup', 'myResourceGroup');
tr.setInput('kubernetesCluster', 'myCluster1');
console.log("Inputs have been set");

process.env['AGENT_VERSION'] = '2.115.0';
process.env["SYSTEM_DEFAULTWORKINGDIRECTORY"] =  DefaultWorkingDirectory;
process.env["SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"] = "https://abc.visualstudio.com/";
process.env["ENDPOINT_AUTH_dockerhubendpoint"] = "{\"parameters\":{\"username\":\"test\", \"password\":\"regpassword\", \"email\":\"test@microsoft.com\",\"registry\":\"https://index.docker.io/v1/\"},\"scheme\":\"UsernamePassword\"}";
process.env["ENDPOINT_AUTH_kubernetesEndpoint"] = "{\"parameters\":{\"kubeconfig\":\"kubeconfig\", \"username\":\"test\", \"password\":\"regpassword\",},\"scheme\":\"UsernamePassword\"}";
process.env["ENDPOINT_AUTH_PARAMETER_kubernetesEndpoint_KUBECONFIG"] =  "{\"apiVersion\":\"v1\", \"clusters\": [{\"cluster\": {\"insecure-skip-tls-verify\":\"true\", \"server\":\"https://5.6.7.8\", \"name\" : \"scratch\"}}], \"contexts\": [{\"context\" : {\"cluster\": \"scratch\", \"namespace\" : \"default\", \"user\": \"experimenter\", \"name\" : \"exp-scratch\"}], \"current-context\" : \"exp-scratch\", \"kind\": \"Config\", \"users\" : [{\"user\": {\"password\": \"regpassword\", \"username\" : \"test\"}]}";
process.env["ENDPOINT_AUTH_SCHEME_AzureRMSpn"] = "ServicePrincipal";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SERVICEPRINCIPALID"] = "MOCK_SPN_ID";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SERVICEPRINCIPALKEY"] = "MOCK_SPN_KEY";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_TENANTID"] = "MOCK_TENANT_ID";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SCHEME"] = "ServicePrincipal";
process.env["ENDPOINT_DATA_AzureRMSpn_SUBSCRIPTIONNAME"] = "sName";
process.env["ENDPOINT_DATA_AzureRMSpn_SUBSCRIPTIONID"] =  "sId";
process.env["ENDPOINT_DATA_AzureRMSpn_SPNOBJECTID"] =  "oId";
process.env["ENDPOINT_DATA_AzureRMSpn_ENVIRONMENT"] = "AzureCloud";
process.env['ENDPOINT_DATA_AzureRMSpn_ENVIRONMENTAUTHORITYURL'] = "https://login.windows.net/";
process.env['ENDPOINT_URL_AzureRMSpn'] = 'https://management.azure.com/';
process.env['ENDPOINT_DATA_AzureRMSpn_ACTIVEDIRECTORYSERVICEENDPOINTRESOURCEID'] = 'https://management.azure.com/';
process.env['AZURE_HTTP_USER_AGENT'] = 'TEST_AGENT';
process.env['PATH'] = KubectlPath;

//mock responses for Azure Resource Manager connection type
nock("https://login.windows.net", {
		reqheaders: {
            "content-type": "application/x-www-form-urlencoded; charset=utf-8"
      	}
    })
	.post('/MOCK_TENANT_ID/oauth2/token/', querystring.stringify({
		resource: "https://management.azure.com/",
		client_id: "MOCK_SPN_ID",
		grant_type: "client_credentials",
		client_secret: "MOCK_SPN_KEY"
	}))
	.reply(200, {
        access_token: "DUMMY_ACCESS_TOKEN"
    }).persist();
    
nock('https://management.azure.com', {
        reqheaders: {
            "authorization": "Bearer DUMMY_ACCESS_TOKEN",
            "content-type": "application/json; charset=utf-8"
        }
    }).get("/subscriptions/sId/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myCluster1/accessProfiles/clusterUser?api-version=2017-08-31")
        .reply(200, {
            properties: {
                kubeConfig: '{\"apiVersion\":\"v1\", \"clusters\": [{\"cluster\": {\"insecure-skip-tls-verify\":\"true\", \"server\":\"https://5.6.7.8\", \"name\" : \"scratch\"}}], \"contexts\": [{\"context\" : {\"cluster\": \"scratch\", \"namespace\" : \"default\", \"user\": \"experimenter\", \"name\" : \"exp-scratch\"}], \"current-context\" : \"exp-scratch\", \"kind\": \"Config\", \"users\" : [{\"user\": {\"password\": \"regpassword\", \"username\" : \"test\"}]}'
            }
        }).persist();

// provide answers for task mock
let a = {
    "which" : {
    },
     "checkPath": {
        [KubectlPath]: true,
        [ConfigurationFilePath]: true,
        [ConfigMapFilePath]: true,
        [ConfigMapDirectoryPath]: true
    },
    "exist": {
        [KubconfigFile]: true
    },
    "exec": {
    }
};

// Add extra answer definitions that need to be dynamically generated
a.exist[ConfigurationFilePath] = true;
a.exist[ConfigMapFilePath] = true;
a.exist[KubectlPath] = true;
a.exist[ConfigMapDirectoryPath] = true;
a.exist[newUserDirPath] = true;

if (JSON.parse(process.env[shared.isKubectlPresentOnMachine]))
{
    a.which["kubectl"] = "kubectl";
}

a.exec[`${KubectlPath} --kubeconfig ${KubconfigFile} get pods -o json`] = {
    "code": 0,
     "stdout": "successfully ran get pods command"
},
a.exec[`kubectl --kubeconfig ${KubconfigFile} apply -f ${ConfigurationFilePath} -o json`] = {
    "code": 0,
    "stdout": "successfully applied the configuration deployment.yaml"
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} get pods -o json`] = {
    "code": 0,
    "stdout": "successfully ran get pods command"
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} expose -f ${ConfigurationFilePath} --port=80 --target-port=8000 -o json`] = {
    "code": 0,
    "stdout": "successfully created a service for deployment in deployment.yaml using expose command"
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} get -n kube-system pods -o json`] = {
    "code": 0,
    "stdout": "successfully fetched the pods in the namespace"
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} delete secret my-secret`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create secret docker-registry my-secret --docker-server=ajgtestacr1.azurecr.io --docker-username=MOCK_SPN_ID --docker-password=MOCK_SPN_KEY --docker-email=ServicePrincipal@AzureRM`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create secret docker-registry my-secret --docker-server=https://index.docker.io/v1/ --docker-username=test --docker-password=regpassword --docker-email=test@microsoft.com`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create secret generic my-secret --from-literal=key1=value1 --from-literal=key2=value2`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} delete configmap myConfigMap`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} get configmap existingConfigMap`] = {
    "code": 0  
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} get configmap someConfigMap`] = {
    "code": 1  
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} get configmap myConfigMap`] = {
    "code": 1  
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create configmap myConfigMap --from-file=configmap.properties=${ConfigMapFilePath}`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create configmap myConfigMap --from-file=${ConfigMapDirectoryPath}`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create configmap myConfigMap --from-literal=key1=value1 --from-literal=key2=value2`] = {
    "code": 0
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} create configmap someConfigMap --from-literal=key1=value1 --from-literal=key2=value2`] = {
    "code": 1,
    "stdout" : "Error in configMap creation"
};
a.exec[`kubectl --kubeconfig ${KubconfigFile} get secrets my-secret -o yaml`] = {
    "code": 0,
    "stdout": "successfully got secret my-secret and printed it in the specified format"
};

tr.setAnswers(<any>a);

// Create mock for fs module
let fs = require('fs');
let fsClone = Object.assign({}, fs);
fsClone.existsSync = function(filePath) {
    switch (filePath) {
        case "kubectl":
            if (JSON.parse(process.env[shared.isKubectlPresentOnMachine]))
            {
                return true;
            }
            else
            {
                return false;
            }
        default:
            return fs.existsSync(filePath);
    }
};

fsClone.writeFileSync = function(fileName, data) {
    switch (fileName) {
        case KubconfigFile:
            console.log("Content of kubeconfig file : " + data); 
            break;
        default:
            return fs.writeFileSync(fileName, data);
    }
};

fsClone.chmod = function(path, mode) {
      switch(path){
          case KubectlPath:
            console.log(`Set kubectlPath to ${KubectlPath} and added permissions`);
            break;
          default:
            fs.chmod(path, mode);        
      }
};

fsClone.statSync = (s: string) => {
    let stat = new Stats;

    stat.isFile = () => {
        if (s.endsWith('.properties')) {
            return true;
        } else {
            return false;
        }
    }

    stat.isDirectory = () => {
        if (s.endsWith('.properties')) {
            return false;
        } else {
            return true;
        }
    }

    stat.size = 100;

    return stat;
}


tr.registerMock('fs', fsClone);

var ut = require('../src/utilities');
tr.registerMock('./utilities', {
    IsNullOrEmpty : ut.IsNullOrEmpty,
    HasItems : ut.HasItems,
    StringWritable: ut.StringWritable,
    PackerVersion: ut.PackerVersion,
    isGreaterVersion: ut.isGreaterVersion,
    getTempDirectory: function() {
        return newUserDirPath;
    },
    getCurrentTime: function() {
        return new Date(1996,3,5);
    },
    getNewUserDirPath: function() {
        return newUserDirPath;
    },   
    getStableKubectlVersion: function(){
        console.log("Get stable kubectl version");
        return "v1.6.6";
    },
    getKubectlVersion: function(versionSpec, checkLatest) {
         let version: string = "v1.6.6";   

        if(checkLatest) {
            version = this.getStableKubectlVersion();
        }
        else if (versionSpec) {
            if(versionSpec === "1.7") {
                console.log("Get stable kubectl version");
                version = this.getStableKubectlVersion();
            } 
            else if(!versionSpec.startsWith("v")) {
                version = "v".concat(versionSpec);
            }
            else {
                version = versionSpec;
            } 
        }

        console.log("Got kubectl version " + version);
        return Promise.resolve(version);
    },
    downloadKubectl: function(version, kubectlPath) {
        console.log("Downloaded kubectl version " + version);
        return KubectlPath;
    },
    assertFileExists: function(path) {
        return true;
    } 
});

tr.run();