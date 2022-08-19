import React from "react";

export default function OutputContainer(props) {
  return (
    <div>
      {props.messages.map((msg) => {
       return ( msg.results.map((result) => {
          return <div>{result.alternatives[0].transcript}</div>
        }))
      })
      }
    </div>
  );
}
