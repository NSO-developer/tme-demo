export default function(hljs) {
  return {
    contains: [
      hljs.COMMENT('![ ]', '$')
    ]
  };
}
