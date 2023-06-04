import React, { Component } from 'react';
import './scss/App.scss';
import { fetchData } from  './scripts/dataFetch';

import {ReactComponent as LeftArrow} from './images/left-arrow.svg';
import {ReactComponent as RightArrow} from './images/right-arrow.svg';
import {ReactComponent as Menu} from './images/menu.svg';
import {ReactComponent as Add} from './images/add.svg';

interface section {
  sectionTitle: string;
  links: Array<link>;
}

interface link {
  linkTitle: string;
  linkURL: string;
  imageURL: string;
}

interface AppState {
  data: Array<section>;
  dataLoaded: boolean;
  selectedSection: number;
  totalSections: number;
  screenWidth: number;
  currentPage: number;
  totalPages: number;

}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { 
      data: [],
      dataLoaded: false,
      selectedSection: 0,
      totalSections: 0,
      screenWidth: window.innerWidth,
      currentPage: 0,
      totalPages: 0,
    };

    this.handleButtonPress = this.handleButtonPress.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
  }

  LinksPerPage = 10;

  async componentDidMount() {
    const data = await fetchData();
    this.setState({ 
      data,
      totalSections: data.length,
    }, () => {
      this.selectSection(this.state.selectedSection, () => {
        this.setState({ dataLoaded: true });
      });
    });
    document.addEventListener('keydown', this.handleButtonPress, false);
    window.addEventListener('resize', this.handleWindowSizeChange, false);
  }

  handleButtonPress(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.altKey && event.code === 'KeyN') {
      alert('Add new link');
    }
    if (event.code === "ArrowRight" || event.code === "ArrowDown") {
      this.changeCurrentPage('increase');
    }
    if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
      this.changeCurrentPage('decrease');
    }
    if (event.code === 'Home') {
      this.selectSection(0);
    }
    if (event.code === 'End') {
      this.selectSection(this.state.totalSections - 1, () => {
        this.setState({ currentPage: this.state.totalPages });
      })
    }
  }

  handleLinkClick(event: React.MouseEvent, location: string) {
    event.stopPropagation();
    if (event.button === 1 || event.ctrlKey) {
      window.open(location, '_blank');
    } else {
      window.location.href = location;
    }
  }

  selectSection(selectedSection: number, callBack?: () => void) {
    this.setState({
      selectedSection,
      currentPage: 1,
    }, () => {
      const totalLinks = this.getAllLinksFromSelectedSection().length + 1;
      this.setState(
        { totalPages: Math.ceil(totalLinks / this.LinksPerPage) },
        () => {
          if (callBack) {
            callBack();
          }
        }
      )
    });
  }

  handleWheel(event: React.WheelEvent) {
    const sensitivity = 0.5;
    if (event.deltaY < -sensitivity || event.deltaX < -sensitivity) {
      this.changeCurrentPage('decrease');   
    } else if (event.deltaY > sensitivity || event.deltaX > sensitivity) {
      this.changeCurrentPage('increase');   
    }
  }

  handleWindowSizeChange() {
    this.setState({ screenWidth: window.innerWidth });
  };

  handlePageChange(newPage: number) {
    this.setState({ currentPage: newPage });
  }

  getAllLinksFromSelectedSection() {
    if (this.state.data) {
      return this.state.data[this.state.selectedSection].links;
    } else {
      return new Array();
    }
  }

  changeCurrentPage(direction: 'increase' | 'decrease') {
    if (direction === 'increase') {
      if (this.state.currentPage < this.state.totalPages) {
        this.setState({ currentPage: this.state.currentPage + 1 });
      } else if (this.state.selectedSection < (this.state.totalSections - 1)) {
        this.selectSection(this.state.selectedSection + 1);
      } else {
        this.selectSection(0);
      }
    } else {
      if (this.state.currentPage > 1) {
        this.setState({ currentPage: this.state.currentPage - 1 });
      } else if (this.state.selectedSection > 0) {
        this.selectSection(this.state.selectedSection - 1, () => {
          this.setState({ currentPage: this.state.totalPages });
        });
      } else {
        this.selectSection(this.state.data.length - 1, () => {
          this.setState({ currentPage: this.state.totalPages });
        });
      }
    }
  }

  renderHeader() {
    return (
      <header>
        <span id="header-title">dash<b>Grid</b>.io</span>
        <div id="account-info-container">
          <div id="user-info">
            <span id="user">Michael Reisz</span>
            <span id="email">michael_reisz@yahoo.com</span>
          </div>
          <div id="user-image">
            <h2>MR</h2>
          </div>
        </div>
      </header>
    )
  }

  renderFooter() {
    return (
      <footer>
        <div id="menu">
          <ul>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Security</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <span id="copyright">&copy; 2019 dash<b>Grid</b>.io</span>
      </footer>
    )
  }

  renderSections() {
    const sections = this.state.data.map((section, index) => 
      <span
        key={index}
        className={`section-option ${index === this.state.selectedSection 
          ? 'selected-section' 
          : ''}`}
        onClick={() => this.selectSection(index)}
      >
        {section.sectionTitle}
      </span>
    )
    return (
      <div id="section-buttons">
        {sections}
        <Menu id="menu-icon"/>
      </div>
    )
  }

  renderLinks() {
    let linkCards = this.getAllLinksFromSelectedSection()
      .slice(
        (this.state.currentPage - 1) * this.LinksPerPage,
        this.state.currentPage * this.LinksPerPage
      ).map((link, index) => 
        <span 
          key={index}
          className='link-card'
          onClick={(event) => this.handleLinkClick(event, link.linkURL)}
        >
          {link.linkTitle}
        </span>
      );
    if (this.state.currentPage === this.state.totalPages) {
      linkCards.push((
        <span key='add-link' className='link-card add-link'>Add Link</span>
      ));
    }
    if (linkCards.length < this.LinksPerPage) {
      console.log('padding needed');
      const padArray: JSX.Element[] = Array.from({ length: this.LinksPerPage - linkCards.length }, 
        (_, index) => <span key={`pad-link-${index}`} className='link-card empty-spot' />
      )
      linkCards = linkCards.concat(padArray);
    }
    
    return (
      <div id="link-container">
        <div className="scroll-container" onClick={() => this.changeCurrentPage('decrease')}>
          <LeftArrow id="scroll-left" />
        </div>
        <div id="links">
          { linkCards }
        </div>
        <div className="scroll-container" onClick={() => this.changeCurrentPage('increase')}>
          <RightArrow id="scroll-right" />
        </div>
      </div>
    )
  }

  renderPageIndicators() {
    const range = Array.from(Array(this.state.totalPages).keys());
    const pageIndicators = range.map((key, index) =>
      <div
        key={index}
        className={`page-indicator 
          ${key + 1 === this.state.currentPage 
            ? 'selected'
            : ''
          }`
        }
        onClick={() => this.handlePageChange(key + 1)}
      />
    )
    return (
      <div id="page-indicators">
        {pageIndicators}
      </div>
    )
  }
  
  render() {
    return (
      <>
        {this.renderHeader()}
        <div id="app" onWheel={this.handleWheel}>
          {this.renderSections()}
          {this.state.dataLoaded ? this.renderLinks() : null}
          {this.renderPageIndicators()}
        </div>
        {this.renderFooter()}
      </>
    );
  }
}

export default App;
