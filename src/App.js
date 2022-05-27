import './App.css';
import React, { useState } from 'react';

import axios from 'axios';

let url = "https://ravenserver.herokuapp.com";
// let url = "http://localhost:5000";

class TextInput extends React.Component {

  makeTextAreas() {
    let textAreas = [];
    let rowList = [];
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
        <button onClick={this.props.generator}>
          {"Generate Image"}
        </button>
        <img src={this.props.image} alt="raven-problem" />
      </div>
    )
  }
}


function downloadItem(uri, fileName) { 
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

class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {blueprint: "", initials: ["","",""], literal: Array(16).fill(""), image: "", target: undefined, human: true, structure: "any"};
    
    this.changeBlueprint = this.changeBlueprint.bind(this);
    this.changeInitials = this.changeInitials.bind(this);
    this.structureToLiteral = this.structureToLiteral.bind(this);
    this.changeLiteral = this.changeLiteral.bind(this);
    this.literalToImage = this.literalToImage.bind(this);
    this.generateBlueprint = this.generateBlueprint.bind(this);
    this.generateInitials = this.generateInitials.bind(this);
    this.downloadNPZ = this.downloadNPZ.bind(this);
    this.downloadLiteral = this.downloadLiteral.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
    this.uploadJSON = this.uploadJSON.bind(this);
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
    let body = {structure: this.state.structure};
    axios
      .post(
        requestUrl,
        body
      )
      .then((response) => {
          this.setState({blueprint: JSON.stringify(response.data, null, 2)})
      });
  }

  generateInitials() {
    let requestUrl = url + "/initials";
    let body = {blueprint: JSON.parse(this.state.blueprint), human: this.state.human};
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
    let body = {blueprint: JSON.parse(this.state.blueprint), initial: initialJSON, human: this.state.human};
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

  uploadJSON(e) {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
        let literalJSON = JSON.parse(e.target.result);
        let human;
        if('human' in literalJSON) {
          human = literalJSON["human"];
        } else {
          human = this.state.human;
        }
        
        let target = literalJSON["target"];
        let panelLst = this.strListify(literalJSON["panels"]);
        this.setState({literal: panelLst, human: human, target: target})

    };
  }

  genFullLiteral() {
    let fullLiteral = {"target": this.state.target, "human": this.state.human};
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
        downloadItem(url, fileName + ".npz");
      })
  }

  downloadLiteral(fileName) {
    let literal = this.genFullLiteral();
    let literalUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(literal, null, 2));
    downloadItem(literalUri, fileName + ".json");
  }

  downloadImage(fileName) {
    let bitString = this.state.image.split(',')[1]
    let imageUri = 'data:application/oct-stream;base64,' + bitString;
    downloadItem(imageUri, fileName + ".jpg");
  }

  
  render() {
    return (
      <div>
        <div className="flex-container">
          <div className="flex-child">
            <HumanCheckbox 
              checked={this.state.human} 
              handleChange={(e) => this.setState({human: e.target.checked})}
            />
            <SelectList options={["any", "center_single", "distribute_four", "distribute_nine", "out_in", "out_in_grid", "left_right", "up_down"]} value={this.state.structure} onChange={(e) => this.setState({structure: e.target.value})} />
            <TextInput
              fieldName={"Blueprint"}
              generator={this.generateBlueprint}
              values={[this.state.blueprint]}
              handleChange={this.changeBlueprint}
              cols={1}
            />
          </div>
          <TextInput
            fieldName={"Initial Panels"}
            generator={this.generateInitials}
            values={this.state.initials}
            handleChange={this.changeInitials}
            cols={1}
          />
          <div className="flex-child">
            <FileUpload handleChange={this.uploadJSON} />
            <TextInput
              fieldName={"All Panels"}
              generator={this.structureToLiteral}
              values={this.state.literal.slice(0,8)}
              handleChange={this.changeLiteral}
              cols={3}
            />
            <LabeledNumberInput label={"Correct answer:"} value={this.state.target} onChange={(e) => this.setState({target: parseInt(e.target.value)})}/>
            
            <TextInput
              fieldName={"Answer Choices"}
              values={this.state.literal.slice(8)}
              handleChange={this.changeLiteral}
              highlightIndex={this.state.target}
              startIndex={8}
              cols={3}
            />
          </div>
          <ImageViewer
            generator={this.literalToImage}
            image={this.state.image}
          />
        </div>
        <DownloadButton downloadImage={this.downloadImage} downloadLiteral={this.downloadLiteral} downloadNPZ={this.downloadNPZ} />
        <SetGenerator />
      </div>
       
    )
  }
}

export function FileUpload(props) {
  const {handleChange} = props;
  return (
      <div>
          <input type="file" onChange={handleChange} />
      </div>
  );

}

export function LabeledNumberInput(props) {
  const { label, value, onChange } = props;

  return (
    <label>
      {label} 
      <input type="number" value={value} onChange={onChange} />
    </label>
  );
}

export function SelectList(props) {
  let { options, value, onChange } = props;

  let htmlOptions = []
  for(let option in options) {
    htmlOptions.push(<option value={options[option]} key={option}>{options[option]}</option>)
  }

  return (
    <select value={value} onChange={onChange}>
      {htmlOptions}
    </select>
  );

}
export function SetGenerator(props) {
  const [count, setCount] = useState(10);
  const [mag, setMag] = useState("all");
  const [concept, setConcept] = useState("base");
  const [genClass, setGenClass] = useState("base");
  const [structure, setStructure] = useState("any");
  const [onlyConcept, setOnlyConcept] = useState(true);

  function requestSet() {
    let body = {concept: concept, mag: mag, count: count, genClass: genClass, structure: structure, onlyConcept: onlyConcept};
    axios
      .post(
        url + '/createset',
        body,
        { responseType: 'blob' },
      )
      .then(response => {
        const url = window.URL.createObjectURL(
          new Blob([response.data]),
        );
        downloadItem(url, `${concept}_${mag}_${genClass}_problems.zip`);
      })
  }

  function onGenClassChange(e) {
    let newGenClass = e.target.value
    if(newGenClass === "slippage") {
      setConcept("base")
    }
    setGenClass(newGenClass)
  }
  function onConceptChange(e) {
    let newConcept = e.target.value
    if(newConcept === "base") {
      setMag("none")
    } else if(newConcept !== "base" && mag === "none") {
      setMag("all")
    }
    setConcept(newConcept)
  }

  function getConceptOptions() {
    if(genClass === "slippage" || genClass === "switch_comps") {
      return ["base"]
    } else {
      return ["base", "constant", "progression"]
    }
  }

  function getMagOptions() {
    if(concept === "base") {
      return ["none"]
    } else {
      return ["all", "boost"]
    }
  }

  function getGenClassOptions() {
    return ["base", "position_row_col", "linecolor", "linesize", "outer_color", "slippage", "switch_comps"];
  }

  // console.log(structure)
  return (
    <div className="flex-child">
      <LabeledNumberInput label={"Count: "} value={count} onChange={(e) => setCount(parseInt(e.target.value))}/>
      <SelectList options={["any", "center_single", "distribute_four", "distribute_nine", "out_in", "out_in_grid", "left_right", "up_down"]} value={structure} onChange={(e) => setStructure(e.target.value)} />
      <SelectList options={getConceptOptions()} value={concept} onChange={onConceptChange} />
      <SelectList options={getMagOptions()} value={mag} onChange={(e) => setMag(e.target.value)} />
      <SelectList options={getGenClassOptions()} onChange={onGenClassChange} />
      <div>
        <label>
          <input
            type="checkbox"
            checked={onlyConcept}
            onChange={(e) => setOnlyConcept(e.target.checked)} />
          Only chosen concept 
        </label>
      </div>
      <button onClick={() => requestSet()}>Download set</button>
    </div>
  );
}

export function HumanCheckbox(props) {
  const {checked, handleChange} = props;
  return (
    <div>
      <label>
        <input
          name="isGoing"
          type="checkbox"
          checked={checked}
          onChange={handleChange} />
        Human Readable
      </label>
    </div>
  );
}

export function DownloadButton(props) {
  const {downloadImage, downloadLiteral, downloadNPZ} = props;
  const [fileName, setFileName] = useState("");

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
