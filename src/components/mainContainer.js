import { React, useEffect, useState } from "react";
import { Icon, Tabs, Pane } from "watson-react-components";
import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone.js';
import OutputContainer from "./outputContainer";

export default function MainContainer() {
  const [audioSource, setAudioSource] = useState(null);
  const [keywords, setKeywords] = useState("en-US_BroadbandModel");
  const [model, setModel] = useState("en-US_BroadbandModel");
  const [speakerLabels, setSpeakerLabels] = useState(false);
  const [formattedMessages, setFormattedMessages] = useState([]);
  const [stream, setStream] = useState();
  const [credential, setCredential] = useState({
    token: "",
    accessToken: "",
    serviceUrl: "",
  });

  const fetchToken = () => {
    return fetch("http://localhost:3001/api/v1/credentials")
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Error retrieving auth token");
        }
        return res.json();
      }) // todo: throw here if non-200 status
      .then((creds) => {
        setCredential({ ...creds });
        console.log(creds);
      });
    //.catch(handleError);
  };

  useEffect(() => {
    fetchToken();
  }, []);

  // en-US_BroadbandModel convert ==>['en-US_BroadbandModel']
  const getKeywordsArrUnique = () => {
    return keywords
      .split(",")
      .map((k) => k.trim())
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  const getRecognizeOptions = () => {
    const keywords = getKeywordsArrUnique();
    return Object.assign({
      // formats phone numbers, currency, etc. (server-side)
      accessToken: credential.accessToken,
      token: credential.token,
      smartFormatting: true,
      format: true, // adds capitals, periods, and a few other things (client-side)
      model: model,
      objectMode: true,
      interimResults: true,
      // note: in normal usage, you'd probably set this a bit higher
      wordAlternativesThreshold: 0.01,
      keywords,
      keywordsThreshold: keywords.length ? 0.01 : undefined, // note: in normal usage, you'd probably set this a bit higher
      timestamps: true, // set timestamps for each word - automatically turned on by speaker_labels
      //   // includes the speaker_labels in separate objects unless resultsBySpeaker is enabled
      speakerLabels: speakerLabels,
      //   // combines speaker_labels and results together into single objects,
      //   // making for easier transcript outputting
      resultsBySpeaker: speakerLabels,
      //   // allow interim results through before the speaker has been determined
      speakerlessInterim: speakerLabels,
      url: credential.serviceUrl,
    });
  };
  const stopTranscription = () => {
    if (stream) {
      stream.stop();
      // stream.removeAllListeners();
      // stream.recognizeStream.removeAllListeners();
    }
    setAudioSource(null);
  };

  const handleTranscriptEnd = () => {
    // note: this function will be called twice on a clean end,
    // but may only be called once in the event of an error
    setAudioSource(null);
  };
  const handleFormattedMessage = (msg) => {
    setFormattedMessages(formattedMessages.concat(msg));
  };

  // grab the formatted messages and also handle errors and such
  const handleStream = (stream) => {
    console.log(stream);
    setStream(stream);
    stream.on("data", handleFormattedMessage).on("end", handleTranscriptEnd);
    // .on("error", this.handleError);


  };

  const handleMicClick = () => {
    // stop record
    setAudioSource(null);
    if (audioSource == "mic") {
      stopTranscription();
      return;
    }
    //start record
    console.log("dennene");
    setAudioSource("mic");
    //recognizeMicrophone(getRecognizeOptions()) send stram
    let formatStream = recognizeMicrophone(getRecognizeOptions());
    console.log(formatStream);
    handleStream(formatStream);
  };
  return (
    <div>
      <div className="flex-buttons">
        <button
          type="button"
          //className={micButtonClass}
          onClick={handleMicClick}
        >
          <Icon
            type={audioSource === "mic" ? "stop" : "microphone"}
            // fill={micIconFill}
          />{" "}
          Record Audio
        </button>
      </div>
      <div>
      {formattedMessages.length !== 0 && console.log(formattedMessages) }
      {formattedMessages.length !== 0 && 
      <OutputContainer messages={[formattedMessages[formattedMessages.length - 1]]}/> }
      </div>
    </div>
  );
}
