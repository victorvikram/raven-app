import './App.css';
import React, { useState } from 'react';

import axios from 'axios';

let url = "https://ravenserver.herokuapp.com";
//let url = "http://localhost:5000";

class TextInput extends React.Component {

  makeTextAreas() {
    let textAreas = [];
    let rowList = []
    let startIndex;
    if(this.props.startIndex == null) {
      startIndex = 0;
    } else {
      startIndex = this.props.startIndex
    }
  
    for(let i in this.props.values) {
      let i_int = parseInt(i);
      let [rowCount, colCount] = this.calculateRequiredSize(this.props.values[i_int]);
      let style;
      if (this.props.highlightIndex != null && i_int === this.props.highlightIndex) {
        style = "highlighted"
      } else {
        style = "regular"
      }
   
      rowList.push(
        <div key={i_int % this.props.cols}>
          <textarea rows={rowCount} cols={colCount} value={this.props.values[i_int]} onChange={(event) => this.props.handleChange(event, startIndex + i_int)} className={style}/>
        </div>
      )
      if(i_int % this.props.cols === this.props.cols - 1 || i_int === this.props.values.length) {
        textAreas.push(<div className="flex-container" key={Math.floor(i_int / this.props.cols)}>{rowList}</div>);
        rowList = []
      }
    }
    if(rowList.length !== 0) {
      textAreas.push(<div className="flex-container" key={textAreas.length}>{rowList}</div>);
    }

    return textAreas;
  }

  calculateRequiredSize(value) {
    let arr = value.split("\n");
    let rowCount = Math.max(arr.length + 1, 5);
    let colCount =  Math.max(arr.reduce((last, curr) => Math.max(last, curr.length), 0) + 1, 20);
    return [rowCount, colCount];
  }
  render() {
    return (
      <div className="flex-child">
        {
          this.props.generator != null &&
          <button onClick={this.props.generator}>
            {"Generate " + this.props.fieldName}
          </button>
        }
        {this.makeTextAreas()}
      </div>
    )
  }
}

class ImageViewer extends React.Component {
  render() {
    return (
      <div className="flex-child">
        <img src={this.props.image} alt="raven-problem" />
        <button onClick={this.props.generator}>
          {"Generate Image"}
        </button>
      </div>
    )
  }
}

class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {blueprint: "", initials: ["","",""], literal: Array(16).fill(""), image: "", target: undefined};
    
    this.changeBlueprint = this.changeBlueprint.bind(this);
    this.changeInitials = this.changeInitials.bind(this);
    this.structureToLiteral = this.structureToLiteral.bind(this);
    this.changeLiteral = this.changeLiteral.bind(this);
    this.literalToImage = this.literalToImage.bind(this);
    this.structureToImage = this.structureToImage.bind(this);
    this.generateBlueprint = this.generateBlueprint.bind(this);
    this.generateInitials = this.generateInitials.bind(this);
    this.downloadNPZ = this.downloadNPZ.bind(this);
    this.downloadLiteral = this.downloadLiteral.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
  }

  changeBlueprint(event, i=0) {
    this.setState({blueprint: event.target.value});
  }

  changeInitials(event, i) {
    let newInitial = this.makeNewArr(event.target.value, i, this.state.initials)
    this.setState({initials: newInitial})
  }

  changeLiteral(event, i) {
    let newLiteral = this.makeNewArr(event.target.value, i, this.state.literal)
  
    this.setState({literal: newLiteral});
  }

  makeNewArr(val, index, arr) {
    let newArr = [...arr];
    newArr[index] = val;
    return newArr;
  }

  generateBlueprint() {
    let requestUrl = url + "/blueprint";
    fetch(requestUrl)
      .then((res) => res.json())
      .then((data) => {
          this.setState({blueprint: JSON.stringify(data, null, 2)})
      });
  }

  generateInitials() {
    let requestUrl = url + "/initials";
    let body = JSON.parse(this.state.blueprint);
    axios
      .post(
        requestUrl,
        body
      )
      .then((response) => {
        let strLst = this.strListify(response.data["results"]);
        this.setState({initials: strLst});
    });

  }

  strListify(lst) {
    let strLst = []
    for(let i in lst) {
      strLst.push(JSON.stringify(lst[i], null, 2))
    }
    return strLst;
  }

  strListParse(lst) {
    let jsonLst = [];

    for(let i in lst) {
      if(lst[i] === "") {
        jsonLst.push({});
      } else {
        jsonLst.push(JSON.parse(lst[i]));
      }
    }
    return jsonLst;
  }

  structureToLiteral() {
    let requestUrl = url + `/literal`;
    let initialJSON = this.strListParse(this.state.initials);
    let body = [JSON.parse(this.state.blueprint), initialJSON];
    axios
      .post(
        requestUrl,
        body
      )
      .then((response) => {
        let strLst = this.strListify(response.data["panels"]);
        this.setState({literal: strLst, target: response.data["target"]});
      });
  }

  genFullLiteral() {
    let fullLiteral = {"target": this.state.target};
    fullLiteral["panels"] = this.strListParse(this.state.literal);
    return fullLiteral;
  }

  literalToImage() {
    let body = this.genFullLiteral();
    axios
      .post(
        url + '/image',
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
        this.setState({image: "data:;base64," + base64});
      });
  }

  downloadNPZ(fileName) {
    let body = this.genFullLiteral();
    axios
      .post(
        url + '/file',
        body,
        { responseType: 'blob' },
      )
      .then(response => {
        const url = window.URL.createObjectURL(
          new Blob([response.data]),
        );
        this.downloadItem(url, fileName + ".npz");
      })
  }

  downloadLiteral(fileName) {
    let literal = this.genFullLiteral();
    let literalUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(literal, null, 2));
    this.downloadItem(literalUri, fileName + ".json");
  }

  downloadImage(fileName) {
    let bitString = this.state.image.split(',')[1]
    let imageUri = 'data:application/oct-stream;base64,' + bitString;
    this.downloadItem(imageUri, fileName + ".jpg");
  }

  downloadItem(uri, fileName) { 
    const link = document.createElement('a');
    
    link.href = uri;
    link.setAttribute(
      'download',
      fileName
    );

    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    
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
            fieldName={"Blueprint"}
            generator={this.generateBlueprint}
            values={[this.state.blueprint]}
            handleChange={this.changeBlueprint}
            cols={1}

          />
          <TextInput
            fieldName={"Initial Panels"}
            generator={this.generateInitials}
            values={this.state.initials}
            handleChange={this.changeInitials}
            cols={1}
          />
          <div className="flex-child">
            <TextInput
              fieldName={"All Panels"}
              generator={this.structureToLiteral}
              values={this.state.literal.slice(0,8)}
              handleChange={this.changeLiteral}
              cols={3}
            />
            <TextInput
              fieldName={"Answer Choices"}
              values={this.state.literal.slice(8)}
              handleChange={this.changeLiteral}
              highlightIndex={this.state.target}
              startIndex={8}
              cols={4}
            />
          </div>
          <ImageViewer
            generator={this.literalToImage}
            image={this.state.image}
          />
        </div>
        <DownloadButton downloadImage={this.downloadImage} downloadLiteral={this.downloadLiteral} downloadNPZ={this.downloadNPZ} />
      </div>
       
    )
  }
}

export function DownloadButton(props) {
  const {downloadImage, downloadLiteral, downloadNPZ} = props;
  let [fileName, setFileName] = useState("");

  function downloadAll() {
    downloadImage(fileName);
    downloadLiteral(fileName);
    downloadNPZ(fileName);
  }
  return (
    <div className="flex-child">
      <input type="text" value={fileName} placeholder="file name (no extension)" onChange={(e) => setFileName(e.target.value)} />
      <button onClick={downloadAll}>Download All</button>
      <button onClick={() => downloadImage(fileName)}>Download Image</button>
      <button onClick={() => downloadLiteral(fileName)}>Download JSON</button>
      <button onClick={() => downloadNPZ(fileName)}>Download NPZ</button>
    </div>
  );
}

function App() {
  return (
    <MainComponent />
  );
}

export default App;
