const k8s = require('@kubernetes/client-node');
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
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  try {
    const podsRes = await k8sApi.listNamespacedPod('default');
    console.log(podsRes.body);
  } catch (err) {
      console.error(err);
  }
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