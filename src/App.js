import './App.css';
import React, { useState } from 'react';

import axios from 'axios';


class TextInput extends React.Component {

  makeTextAreas() {
    let textAreas = [];
    for(let i in this.props.values) {
      textAreas.push(
        <div key={i} className="flex-child">
          <label>{this.props.fieldNames[i]}</label>
          {this.props.generators[i] && 
            <button onClick={this.props.generators[i]}>
              Random
            </button>
          }
          <textarea value={this.props.values[i]} onChange={this.props.handleChange[i]} />
        </div>
      );
    }
    return textAreas;
  }
  render() {
    return (
      <div className="flex-child">
        {this.makeTextAreas()}
        <button onClick={this.props.handleSubmit}>
          {this.props.buttonName}
        </button>
      </div>
    )
  }
}

class ImageViewer extends React.Component {
  render() {
    return (
      <div className="flex-child">
        <img src={this.props.image} alt="raven-problem" />
      </div>
    )
  }
}

class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {blueprint: "", initials: "", literal: "", image: ""};
    
    this.changeBlueprint = this.changeBlueprint.bind(this);
    this.changeInitials = this.changeInitials.bind(this);
    this.structureToLiteral = this.structureToLiteral.bind(this);
    this.changeLiteral = this.changeLiteral.bind(this);
    this.literalToImage = this.literalToImage.bind(this);
    this.structureToImage = this.structureToImage.bind(this);
    this.generateBlueprint = this.generateBlueprint.bind(this);
    this.generateInitials = this.generateInitials.bind(this);
  }

  changeBlueprint(event) {
    this.setState({blueprint: event.target.value});
  }

  changeInitials(event) {
    this.setState({initials: event.target.value})
  }

  generateBlueprint() {
    let requestUrl = "/blueprint";
    fetch(requestUrl)
      .then((res) => res.json())
      .then((data) => {
          this.setState({blueprint: JSON.stringify(data, null, 2)})
      });
  }

  generateInitials() {
    let requestUrl = "/initials";
    let body = JSON.parse(this.state.blueprint);
    axios
      .post(
        requestUrl,
        body
      )
      .then((response) => {
        this.setState({initials: JSON.stringify(response.data["results"], null, 2)});
    });

  }

  structureToLiteral() {
    let requestUrl = `/literal`;
    let body = [JSON.parse(this.state.blueprint), JSON.parse(this.state.initials)];
    axios
      .post(
        requestUrl,
        body
      )
      .then((response) => {
        this.setState({literal: JSON.stringify(response.data, null, 2)});
      });
  }

  changeLiteral(event) {
    this.setState({literal: event.target.value});
  }

  literalToImage() {
    let body = JSON.parse(this.state.literal);
    axios
      .post(
        '/image',
        body,
        { responseType: 'arraybuffer' },
      )
      .then(response => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        this.setState({ image: "data:;base64," + base64 });
      });

  }

  structureToImage() {
    let literal = "poop poop poop" + this.state.structure;
    let image = "pee pee pee" + literal;
    this.setState({literal: literal})
    this.setState({image: image})
  }

  render() {
    return (
      <div>
        <div className="flex-container">
          <TextInput
            fieldNames={["Blueprint:", "Initial panels:"]}
            generators={[this.generateBlueprint, this.generateInitials]}
            values={[this.state.blueprint, this.state.initials]}
            handleChange={[this.changeBlueprint, this.changeInitials]} 
            buttonName={"Generate Literal"}
            handleSubmit={this.structureToLiteral} 
          />
          <TextInput
            fieldNames={["Literal problem representation:"]}
            generators={[null]}
            values={[this.state.literal]}
            handleChange={[this.changeLiteral]}
            buttonName={"Generate Image"}
            handleSubmit={this.literalToImage}
          />
          <ImageViewer
            image={this.state.image}
          />
        </div>
        <DownloadButton image={this.state.image} literal={this.state.literal} />
      </div>
       
    )
  }
}

export function DownloadButton(props) {
  const {image, literal} = props;
  let [fileName, setFileName] = useState("");

  let bitString = image.split(',')[1]
  let imageUri = 'data:application/oct-stream;base64,' + bitString;
  let literalUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(literal);

  return (
    <div className="flex-child">
      <input type="text" value={fileName} placeholder="file name (no extension)" onChange={(e) => setFileName(e.target.value)} />
      <a download={fileName + ".jpg"} href={imageUri}>
        Download Image
      </a>
      <a download={fileName + ".json"} href={literalUri}>
        Download Literal
      </a>
    </div>
  );
}

function App() {
  return (
    <MainComponent />
  );
}

export default App;
