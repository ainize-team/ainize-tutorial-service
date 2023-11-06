import * as yaml from 'js-yaml';
import { promises as fs } from 'fs';
import * as k8s from '@kubernetes/client-node';
const checkParams = (value: any) => {
  if (typeof value !== 'object') return false;
  // FIXME(yoojin): check required params and fix.
  // Required params.
  if (
    value.model
  ) return true;
  return false;
};

const evaluate = async (value: any) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromFile('/home/ubuntu/ainize-tutorial-service/.kubeconfig');
  const client = k8s.KubernetesObjectApi.makeApiClient(kc);
  let specString = await fs.readFile('/home/ubuntu/ainize-tutorial-service/deployment.yaml', 'utf8');
  console.log("input:", value.prompt);
  specString = specString.replace(/\$\(MODEL\)/g, value.prompt.model);
  specString = specString.replace(/\$\(MODEL_ARGS\)/g, value.prompt.model_args);
  specString = specString.replace(/\$\(TASKS\)/g, value.prompt.tasks);
  specString = specString.replace(/\$\(REQUEST_KEY\)/g, value.prompt.request_key);
  console.log(specString);
  const specs: k8s.KubernetesObject[] = yaml.loadAll(specString) as k8s.KubernetesObject[];
  const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
  const created: k8s.KubernetesObject[] = [];
  for (const spec of validSpecs) {
      // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
      // without metadata out
      spec.metadata = spec.metadata ? spec.metadata : {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
      spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);
      try {
        // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
        // block.
        // @ts-ignore
        await client.read(spec);
        // we got the resource, so it exists, so patch it
        //
        // Note that this could fail if the spec refers to a custom resource. For custom resources you may need
        // to specify a different patch merge strategy in the content-type header.
        //
        // See: https://github.com/kubernetes/kubernetes/issues/97423
        const response = await client.patch(spec);
        created.push(response.body);
    } catch (e) {
      try {
        // we did not get the resource, so it does not exist, so create it
        const response = await client.create(spec);
        created.push(response.body);
      } catch (e) {
        console.log('error: service:54');
    }
  }
  console.log(created);
  return JSON.stringify(created);
}

const paramStringify = (value: any) => {
  const paramString = `
    ${value.model ? `--model ${value.model} \\` : '' }
    ${value.model_args ? `--model_args ${value.model_args} \\` : '' }
    ${value.tasks ? `--tasks ${value.tasks} \\` : '' }
    ${value.provid_description ? `--provid_description ${value.provid_description} \\` : '' }
    ${value.num_fewshot ? `--num_fewshot ${value.num_fewshot} \\` : '' }
    ${value.batch_size ? `--batch_size ${value.batch_size} \\` : '' }
    ${value.max_batch_size ? `--max_batch_size ${value.max_batch_size} \\` : '' }
    ${value.device ? `--device ${value.device} \\` : '' }
    ${value.output_path ? `--output_path ${value.output_path} \\` : '' }
    ${value.data_sampling ? `--data_sampling ${value.data_sampling} \\` : '' }
    ${value.no_cache ? `--no_cache ${value.no_cache} \\` : '' }
    ${value.decontamination_ngrams_path ? `--decontamination_ngrams_path ${value.decontamination_ngrams_path} \\` : '' }
    ${value.description_dict_path ? `--description_dict_path ${value.description_dict_path} \\` : '' }
    ${value.check_integrity ? `--check_integrity ${value.check_integrity} \\` : '' }
    ${value.write_out ? `--write_out ${value.write_out} \\` : '' }
    ${value.output_base_path ? `--output_base_path ${value.output_base_path} \\` : '' }
  `;
  return paramString;
};

export { checkParams, paramStringify, evaluate}