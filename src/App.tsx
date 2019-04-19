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
  selectedSection: string;
  ctrlPressed: boolean;
  screenWidth: number;
  currentPage: number;
  totalPages: number;

}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { 
      data: [],
      selectedSection: '',
      ctrlPressed: false,
      screenWidth: window.innerWidth,
      currentPage: 0,
      totalPages: 0,
    };

    this.handleButtonPress = this.handleButtonPress.bind(this);
    this.handleButtonRelease = this.handleButtonRelease.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
  }

  LinksPerPage = 10;

  async componentDidMount() {
    const data = await fetchData();
    this.setState({ data,
      selectedSection: data[0].sectionTitle
    }, () => {
      this.handleSectionSelection(this.state.selectedSection);
    });
    document.addEventListener('keydown', this.handleButtonPress, false);
    document.addEventListener('keyup', this.handleButtonRelease, false);
    window.addEventListener('resize', this.handleWindowSizeChange, false);
  }

  handleButtonPress(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.ctrlKey) {
      this.setState({ ctrlPressed: true });
    }
  }

  handleButtonRelease(event: KeyboardEvent) {
    event.stopPropagation();
    if (!event.ctrlKey) {
      this.setState({ ctrlPressed: false })
    }
  }

  handleLinkClick(event: React.MouseEvent, location: string) {
    event.stopPropagation();
    if (event.ctrlKey) {
      window.open(location, '_blank');
    } else {
      window.location.href = location;
    }
  }

  handleSectionSelection(selectedSection: string) {
    this.setState({
      selectedSection,
      currentPage: 1,
    }, () => {
      const totalLinks = this.getAllLinksFromSelectedSection().length;
      this.setState({ totalPages: Math.ceil(totalLinks / this.LinksPerPage) })
    });
  }

  handleWheel(event: React.WheelEvent) {
    const sensitivity = 0.4;
    if (event.deltaY < -sensitivity || event.deltaX < -sensitivity) {
      if (this.state.currentPage > 1) {
        this.setState({ currentPage: this.state.currentPage - 1 });
      };   
    } else if (event.deltaY > sensitivity || event.deltaX > sensitivity) {
      if (this.state.currentPage < this.state.totalPages) {
        this.setState({ currentPage: this.state.currentPage + 1 });
      }
    }
  }

  handleWindowSizeChange() {
    this.setState({ screenWidth: window.innerWidth });
  };

  handlePageChange(newPage: number) {
    this.setState({ currentPage: newPage });
  }

  getAllLinksFromSelectedSection() {
    return this.state.data
      .filter(section => section.sectionTitle === this.state.selectedSection)[0].links;
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
    const sections = this.state.data.map((section, key) => 
      <span 
        key={key} 
        className={`section-option ${section.sectionTitle === this.state.selectedSection 
          ? 'selected-section' 
          : ''}`}
        onClick={() => this.handleSectionSelection(section.sectionTitle)}
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
    return (
      <div id="link-container">
        {this.getAllLinksFromSelectedSection()
          .slice(
            (this.state.currentPage - 1) * this.LinksPerPage,
            this.state.currentPage * this.LinksPerPage
          ).map((link, key) => 
            <span 
              key={key}
              className='link-card'
              onClick={(event) => this.handleLinkClick(event, link.linkURL)}
            >
              {link.linkTitle}
            </span>
          )
        }
      </div>
    )
  }

  renderPageIndicators() {
    if (this.state.totalPages > 1) {
      const range = Array.from(Array(this.state.totalPages).keys());
      const pageIndicators = range.map((key) =>
        <div
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
    } else {
      return null;
    }
  }
  
  render() {
    return (
      <>
        {this.renderHeader()}
        <div id="app" onWheel={this.handleWheel}>
          {this.renderSections()}
          {this.state.selectedSection ? this.renderLinks() : null}
          {this.renderPageIndicators()}
        </div>
        {this.renderFooter()}
      </>
    );
  }
}

export default App;
