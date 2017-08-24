const FileItem = require('./FileItem');
const DefaultFileItem = require('./DefaultFileItem');
const Picker = require('./Picker');
const util = require('./util');
const { Events, Status } = require('uploadcore');
const React = require('react');
const Album = require('uxcore-album');

const { Photo } = Album;

class FileList extends React.Component {
  constructor(props) {
    super(props);

    this.core = props.core;

    this.state = {
      items: this.core.getStat().getFiles(),
    };
  }

  componentDidMount() {
    const statchange = (stat) => {
      this.setState({
        items: stat.getFiles(),
      });
    };
    this.core.on(Events.QUEUE_STAT_CHANGE, statchange);
    this.stopListen = () => {
      this.core.off(Events.QUEUE_STAT_CHANGE, statchange);
    };
  }

  componentWillUnmount() {
    if (this.stopListen) {
      this.stopListen();
    }
  }

  onShowFile(file, url, current) {
    if (this.props.isOnlyImg && url) {
      const fileList = this.props.fileList.map((item, index) => {
        if (item.response) {
          const { previewUrl } = util.getUrl(item.response);
          return (<Photo
            src={previewUrl}
            key={index}
          />);
        }
        return null;
      });

      const shows = fileList.filter(item => !!item);

      Album.show({
        photos: shows,
        current,
      });
    } else {
      window.open(url);
    }
  }

  renderDefaultFileItems() {
    const me = this;
    const arr = [];
    this.props.fileList.forEach((file, index) => {
      if (file.type !== 'delete') {
        arr.push(
          <DefaultFileItem
            file={file}
            locale={this.props.locale}
            key={index}
            mode={this.props.mode}
            isOnlyImg={this.props.isOnlyImg}
            readOnly={this.props.readOnly}
            isVisual={this.props.isVisual}
            onShowFile={(currentFile, url) => { this.onShowFile(currentFile, url, index); }}
            onCancel={this.props.removeFileFromList.bind(this)}
          />);
      }
    });
    return arr;
  }

  renderFileItems() {
    const arr = [];
    this.state.items.forEach((file) => {
      if ([Status.CANCELLED, Status.SUCCESS, Status.QUEUED].indexOf(file.status) === -1) {
        arr.push(
          <FileItem
            locale={this.props.locale}
            key={file.id}
            file={file}
            mode={this.props.mode}
            isOnlyImg={this.props.isOnlyImg}
            isVisual={this.props.isVisual}
            interval={this.props.interval}
          />);
      }
    });
    return arr;
  }

  render() {
    return (
      <div className={`kuma-upload-filelist ${this.props.mode === 'nw' ? 'nwmode' : (this.props.mode === 'mini' ? 'minimode' : 'iconmode')}${this.props.isVisual ? ' filelist-visual' : ''}`}>
        <div className="inner fn-clear">
          {this.renderDefaultFileItems()}
          {this.renderFileItems()}
          {!this.core.isFull() && this.props.mode === 'icon' ? <Picker core={this.core}><i className="kuma-icon kuma-icon-add" /></Picker> : null}
        </div>
      </div>
    );
  }
}

FileList.defaultProps = {
  mode: 'mini',
};

FileList.propTypes = {
  locale: React.PropTypes.string,
  mode: React.PropTypes.string,
  isVisual: React.PropTypes.bool,
  isOnlyImg: React.PropTypes.bool,
  readOnly: React.PropTypes.bool,
  fileList: React.PropTypes.array,
  core: React.PropTypes.any,
};

module.exports = FileList;
