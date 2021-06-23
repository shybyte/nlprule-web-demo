import {render} from "solid-js/web";

interface HelloMessageProps {
  name: string;
}

const HelloMessage = (props: HelloMessageProps) => <div>Hello {props.name}</div>;


export function renderApp() {
  render(() => <HelloMessage name="Marco"/>, document.getElementById("hello-example")!);
}
