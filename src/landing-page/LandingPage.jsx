import React, { useEffect, useRef } from 'react';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';
import { Link } from 'react-router-dom';

const fadeSections = [
  'develop-skills',
  'why-choose-this',
  'programming-courses',
  'join-platform',
  'digital-literacy-courses',
];

const LandingPage = () => {
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeSections.forEach((id) => {
      if (sectionRefs.current[id]) {
        observer.observe(sectionRefs.current[id]);
      }
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">
      <div id="navigation">
        <h1>
          <img src="/images/logo.png" alt="" /> LoopTech
        </h1>
        <nav>
          <ul>
            <li>Explore</li>
            <li>Resources</li>
            <li id="about">About Us</li>
            <li id="log-in">
              <Link to="/login">Log In</Link>
            </li>
            <li id="sign-up">
              <Link to="/signup">
                <button>Sign Up</button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <header>
        <div id="header-text">
          <h2>Play Your Way to a Digital Future!</h2>
          <p>
            Dive into fun lessons, challenges, and adventures that teach coding
            and digital skills made for young learners.
          </p>
          <Link to="/signup">
            <button>Join Now</button>
          </Link>
          <div className="header-number course-number">
            <img id="book-icon" src="/images/book-icon.png" alt="" />
            <p>
              <span className="number">50+</span>
              <br />
              Online Courses
            </p>
          </div>
          <div className="header-number learner-number">
            <p>
              <span className="number">10k+</span>
              <br />
              Online Learners
            </p>
            <img
              id="learners"
              src="/images/landing-page/learners.png"
              alt=""
            />
          </div>
        </div>
      </header>

      <div className="text-animation">
        <ul>
          <li>Coding</li>
          <li>Gaming</li>
          <li>Learning</li>
          <li>Digital</li>
          <li>Play</li>
          <li>Skills</li>
          <li>Quests</li>
          <li>Youth</li>
          <li>Challenges</li>
          {/* Duplicate for infinite scroll */}
          <li>Coding</li>
          <li>Gaming</li>
          <li>Learning</li>
          <li>Digital</li>
          <li>Play</li>
          <li>Skills</li>
          <li>Quests</li>
          <li>Youth</li>
          <li>Challenges</li>
        </ul>
      </div>

      <div id="develop-skills" ref={el => (sectionRefs.current['develop-skills'] = el)}>
        <img
          id="computer"
          src="/images/landing-page/computer.png"
          alt=""
        />
        <div>
          <h2>
            Develop<span className="h2-reg"> your skills</span>
          </h2>
          <ul>
            <li>
              <img
                className="check-mark"
                src="/images/check-mark.png"
                alt=""
              />
              Learn digital literacy and coding through exciting games and
              challenges.
            </li>
            <li>
              <img
                className="check-mark"
                src="/images/check-mark.png"
                alt=""
              />
              Team up or compete with friends for extra fun.
            </li>
            <li>
              <img
                className="check-mark"
                src="/images/check-mark.png"
                alt=""
              />
              Enjoy content made for Filipino students and culture.
            </li>
            <li>
              <img
                className="check-mark"
                src="/images/check-mark.png"
                alt=""
              />
              Access anytime, anywhere — all from your browser.
            </li>
          </ul>
        </div>
      </div>

      <div id="why-choose-this" ref={el => (sectionRefs.current['why-choose-this'] = el)}>
        <div id="why-choose-text">
          <h2>
            <span className="h2-reg">Why choose<br />this</span> platform?
          </h2>
          <p>
            Because it's more than just lessons. It's a safe, kid-friendly space
            where young Filipinos can build real coding and digital skills for
            the future. Lessons are hands-on and interactive, helping learners
            develop problem-solving and critical thinking while growing at their
            own pace.
          </p>
        </div>
        <img
          id="why-choose-this-person"
          src="/images/landing-page/why-choose-this-person.png"
          alt=""
        />
      </div>

      <div id="programming-courses" ref={el => (sectionRefs.current['programming-courses'] = el)}>
        <div id="programming-courses-text">
          <h2>
            <span className="h2-reg">Explore</span> Programming{' '}
            <span className="h2-reg">Fun</span>
          </h2>
          <p>
            Dive into a world where coding becomes an adventure! Through
            exciting games, creative challenges, and hands-on projects, you'll
            learn how to build apps, design animations, and solve real-world
            problems. Discover how programming can be both fun and powerful as
            you bring your ideas to life.
          </p>
        </div>
        <div className="courses">
          <div className="courses-coding">
            <h3>Problem Solving</h3>
            <p>
              <span className="difficulty">Easy</span>
              <br />
              <img className="clock" src="/images/clock.png" alt="" /> 60 min
            </p>
            <button>Start Learning</button>
          </div>
          <div className="courses-coding algo">
            <h3>Algorithms</h3>
            <p>
              <span className="difficulty">Medium</span>
              <br />
              <img className="clock" src="/images/clock.png" alt="" /> 60 min
            </p>
            <button>Start Learning</button>
          </div>
          <div className="courses-coding">
            <h3>Artificial Intelligence</h3>
            <p>
              <span className="difficulty">Medium</span>
              <br />
              <img className="clock" src="/images/clock.png" alt="" /> 60 min
            </p>
            <button>Start Learning</button>
          </div>
        </div>
      </div>

      <div id="join-platform" ref={el => (sectionRefs.current['join-platform'] = el)}>
        <h2>STAY IN THE LOOP</h2>
        <p>
          Join the Philippines' top platform for fun, trusted digital learning.
        </p>
        <img
          id="ph-map"
          src="/images/landing-page/join-platform-ph.png"
          alt="Join platform illustration"
        />
      </div>

      <div id="digital-literacy-courses" ref={el => (sectionRefs.current['digital-literacy-courses'] = el)}>
        <h2>Master Digital Literacy</h2>
        <p id="description">
          Step into the digital world with confidence! Learn how to stay safe
          online, spot reliable information, and use technology smartly in your
          daily life. From understanding digital tools to exploring how the
          internet works, our lessons help you develop essential skills for
          school, play, and your future.
        </p>
        <div id="courses-digital-group">
          <div className="courses-digital-literacy">
            <img
              className="course-img"
              src="/images/landing-page/vpn.jpg"
              alt="VPN lesson"
            />
            <div className="course-description">
              <p>July 1, 2025</p>
              <h3>Staying Safe and Wise Online</h3>
            </div>
          </div>
          <div className="courses-digital-literacy finding-truth">
            <img
              className="course-img"
              src="/images/landing-page/truth.jpg"
              alt="Truth lesson"
            />
            <div className="course-description">
              <p>July 1, 2025</p>
              <h3>Finding Truth on the Internet</h3>
            </div>
          </div>
          <div className="courses-digital-literacy">
            <img
              className="course-img"
              src="/images/landing-page/kind.jpg"
              alt="Kindness lesson"
            />
            <div className="course-description">
              <p>July 1, 2025</p>
              <h3>Being Kind in Digital Spaces</h3>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div id="brand-footer">
          <h2 id="logo">
            <img src="/images/logo-white.png" alt="" /> LoopTech
          </h2>
          <p id="brand-description">
            Our platform is dedicated to helping young Filipinos discover the
            exciting world of coding and digital literacy. We create a safe,
            kid-friendly space where students can build real skills, explore
            their creativity, and connect with friends while growing confident
            in using technology.
          </p>
          <h2>Follow Us</h2>
          <p>
            <img src="/images/facebook.png" alt="Facebook" />
            <img src="/images/instagram.png" alt="Instagram" />
            <img src="/images/x.png" alt="X/Twitter" />
          </p>
        </div>
        <div id="about">
          <h2>About</h2>
          <ul>
            <li>Our Work and Impact</li>
            <li>How We Work</li>
            <li>Diversity &amp; Inclusion</li>
            <li>Meet Our Team</li>
            <li>Board of Directors</li>
            <li>Board of Advisors</li>
            <li>Our Partners</li>
            <li>Our Offices</li>
            <li>Press Room</li>
            <li>Annual Report</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div id="learn-more">
          <h2>Learn More</h2>
          <ul>
            <li>Platform Media</li>
            <li>Platform Media</li>
            <li>Platform Education</li>
            <li>Digital Citizenship Program</li>
            <li>Family Engagement Program</li>
            <li>Privacy Program</li>
            <li>Research Program</li>
            <li>Advocacy Program</li>
          </ul>
        </div>
        <div id="get-involved">
          <h2>Get Involved</h2>
          <ul>
            <li>Donate</li>
            <li>Join as a Parent</li>
            <li>Join as an Advocate</li>
            <li>Get Our Newsletters</li>
            <li>Request a Speaker</li>
            <li>Partner With Us</li>
            <li>Events</li>
            <li>We're Hiring</li>
          </ul>
        </div>
      </footer>
      <FloatingChatbot />
    </div>
  );
};

export default LandingPage;
