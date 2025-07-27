"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import Image from "next/image";
import * as THREE from 'three';

export default function Home() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCheckingClaim, setIsCheckingClaim] = useState(false);
  const [emailAlreadyClaimed, setEmailAlreadyClaimed] = useState(false);
  const cubeContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubesRef = useRef<THREE.Mesh[]>([]);

  const isMobile = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  };

  useEffect(() => {
    const checkMobile = () => {
      setMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Animation sequence: Logo first, then form
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      // Show form after logo fades out
      const formTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 600);
      
      return () => clearTimeout(formTimer);
    }, 2000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(logoTimer);
    };
  }, []);

  // Check if email has already been claimed
  const checkEmailClaimStatus = async (emailToCheck: string) => {
    if (!emailToCheck) {
      setEmailAlreadyClaimed(false);
      return;
    }

    setIsCheckingClaim(true);
    try {
      const response = await fetch('/api/check-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setEmailAlreadyClaimed(data.hasClaimed);
        if (data.hasClaimed) {
          setStatus("This email has already been used to claim an NFT");
        } else {
          setStatus("");
        }
      }
    } catch (error) {
      console.error('Failed to check claim status:', error);
    } finally {
      setIsCheckingClaim(false);
    }
  };

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        checkEmailClaimStatus(email);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [email]);

  // Three.js 3D Cube Scene Setup
  useEffect(() => {
    if (!cubeContainerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      cubeContainerRef.current.clientWidth / cubeContainerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(cubeContainerRef.current.clientWidth, cubeContainerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    cubeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create cubes
    const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    
    // Create different materials for variety
    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0xe10600,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xff3c3c,
        transparent: true,
        opacity: 0.7,
        shininess: 80
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xcc0000,
        transparent: true,
        opacity: 0.8,
        shininess: 120
      })
    ];

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xe10600, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff3c3c, 1, 10);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);

    const cubes: THREE.Mesh[] = [];
    for (let i = 0; i < 25; i++) {
      const material = materials[i % materials.length];
      const cube = new THREE.Mesh(cubeGeometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      cube.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Add glow effect
      const glowGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xe10600,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      cube.add(glow);
      
      scene.add(cube);
      cubes.push(cube);
    }
    cubesRef.current = cubes;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate and float cubes
      cubes.forEach((cube, index) => {
        const speed = 0.02;
        const time = Date.now() * 0.001;
        
        // Different rotation speeds for each axis
        cube.rotation.x += speed * (index % 3 + 1) * 0.5;
        cube.rotation.y += speed * (index % 2 + 1) * 0.7;
        cube.rotation.z += speed * (index % 4 + 1) * 0.3;
        
        // Floating animation with different patterns
        cube.position.y += Math.sin(time + index * 0.5) * 0.003;
        cube.position.x += Math.cos(time + index * 0.3) * 0.002;
        cube.position.z += Math.sin(time + index * 0.7) * 0.001;
        
        // Scale animation for breathing effect
        const scale = 1 + Math.sin(time + index) * 0.1;
        cube.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cubeContainerRef.current || !renderer) return;
      
      const width = cubeContainerRef.current.clientWidth;
      const height = cubeContainerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
};

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer && cubeContainerRef.current) {
        cubeContainerRef.current.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim wallet address to handle copy-paste issues
    const trimmedWallet = wallet.trim();
    
    if (!trimmedWallet) {
      setStatus("Please enter your wallet address");
      return;
    }
    
    // Basic wallet address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)) {
      setStatus("Please enter a valid wallet address");
      return;
    }
    
    if (emailAlreadyClaimed) {
      setStatus("This email has already been used to claim an NFT");
      return;
    }
    
    if (claimed) {
      setStatus("NFT already claimed");
      return;
    }

    setIsClaiming(true);
    setStatus("Claiming NFT...");

    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          walletAddress: trimmedWallet,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setClaimed(true);
        setEmailAlreadyClaimed(true);
        setStatus(`Success! NFT claimed. Transaction: ${data.transactionHash}`);
      } else {
        setStatus(data.error || "Failed to claim NFT");
      }
    } catch (error) {
      console.error('Claim error:', error);
      setStatus("Failed to claim NFT. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'url("/bg.svg") no-repeat center center fixed',
      backgroundSize: 'cover',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: mobile ? '20px' : '40px',
      position: 'relative',
      fontFamily: 'var(--font-gabarito), Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Background overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 0,
      }} />
      
      {/* 3D Cubes Container */}
      <div 
        ref={cubeContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      
      {/* Logo Loading Screen */}
      {showLogo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: showLogo ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out',
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <Image
              src="/jbecp-logo.svg"
              alt="JBECP"
              width={mobile ? 200 : 300}
              height={mobile ? 200 : 300}
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 30px rgba(225, 6, 0, 0.4))',
              }}
            />
            <div style={{
              marginTop: '20px',
              fontSize: mobile ? '16px' : '20px',
              color: '#ffffff',
              fontWeight: '300',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}>
              Loading...
            </div>
          </div>
        </div>
      )}
      
      {/* Main Form Container */}
      {!showLogo && (
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '500px',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(15, 15, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: mobile ? '30px 20px' : '50px 40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(225, 6, 0, 0.1)',
          border: '1px solid rgba(225, 6, 0, 0.2)',
        }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          position: 'relative',
          height: mobile ? '120px' : '180px',
        }}>
          {/* 3D Cube Scene */}
          <div 
            ref={cubeContainerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
            }}
          />
          
          {/* Enhanced logo container with glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(225, 6, 0, 0.3))',
          }}>
            <Image
              src="/blockcelerate.svg"
              alt="BLOCKCELERATE"
              width={mobile ? 600 : 900}
              height={mobile ? 180 : 270}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          </div>
          
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: mobile ? '400px' : '600px',
            height: mobile ? '120px' : '180px',
            background: 'radial-gradient(ellipse, rgba(225, 6, 0, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
            animation: 'pulse 4s ease-in-out infinite',
          }} />
          
          <p style={{
            fontSize: mobile ? '14px' : '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            fontWeight: '400',
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            NFT Claim Portal
          </p>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
          }
        `}</style>

        <form onSubmit={handleClaim} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {/* Email Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: emailAlreadyClaimed 
                  ? '2px solid rgba(239, 68, 68, 0.5)' 
                  : '2px solid rgba(225, 6, 0, 0.3)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                backdropFilter: 'blur(10px)',
              }}
              onFocus={e => {
                e.target.style.borderColor = emailAlreadyClaimed ? '#ef4444' : '#e10600';
                e.target.style.boxShadow = `0 0 0 3px ${emailAlreadyClaimed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(225, 6, 0, 0.2)'}`;
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={e => {
                e.target.style.borderColor = emailAlreadyClaimed ? 'rgba(239, 68, 68, 0.5)' : 'rgba(225, 6, 0, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            />
            {isCheckingClaim && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#fbbf24',
                fontStyle: 'italic',
              }}>
                Checking claim status...
              </div>
            )}
          </div>

          {/* Wallet Address Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}>
              Wallet Address
            </label>
            <input
              type="text"
              required
              placeholder="Enter your wallet address"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              style={{
                width: '100%',
                              padding: '16px',
              fontSize: '16px',
              border: '2px solid rgba(225, 6, 0, 0.3)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backdropFilter: 'blur(10px)',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#e10600';
                e.target.style.boxShadow = '0 0 0 3px rgba(225, 6, 0, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(225, 6, 0, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          {/* Claim Button */}
          <button
            type="submit"
            disabled={isClaiming || !wallet.trim() || !email || emailAlreadyClaimed}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              background: isClaiming || !wallet.trim() || !email || emailAlreadyClaimed
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #e10600 0%, #ff3c3c 100%)',
              color: isClaiming || !wallet.trim() || !email || emailAlreadyClaimed ? '#666666' : '#fff',
              cursor: isClaiming || !wallet.trim() || !email || emailAlreadyClaimed ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '8px',
              boxShadow: isClaiming || !wallet.trim() || !email || emailAlreadyClaimed
                ? 'none' 
                : '0 4px 12px rgba(225, 6, 0, 0.4), 0 0 0 1px rgba(225, 6, 0, 0.2)',
            }}
            onMouseOver={e => {
              if (!isClaiming && wallet.trim() && email && !emailAlreadyClaimed) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(225, 6, 0, 0.6), 0 0 0 1px rgba(225, 6, 0, 0.3)';
              }
            }}
            onMouseOut={e => {
              if (!isClaiming && wallet.trim() && email && !emailAlreadyClaimed) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 6, 0, 0.4), 0 0 0 1px rgba(225, 6, 0, 0.2)';
              }
            }}
          >
            {isClaiming ? 'Claiming...' : emailAlreadyClaimed ? 'Already Claimed' : 'Claim NFT'}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
            background: status.includes("Success") || status.includes("connected")
              ? 'rgba(34, 197, 94, 0.2)' 
              : 'rgba(239, 68, 68, 0.2)',
            color: status.includes("Success") || status.includes("connected")
              ? '#4ade80' 
              : '#f87171',
            border: `1px solid ${status.includes("Success") || status.includes("connected")
              ? 'rgba(34, 197, 94, 0.3)' 
              : 'rgba(239, 68, 68, 0.3)'}`,
            backdropFilter: 'blur(10px)',
          }}>
            {status}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#e10600',
          fontWeight: '500',
        }}>
          <a 
            href="https://github.com/antuK3n/jbecp-pup-nftclaim" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#e10600',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationColor: 'rgba(225, 6, 0, 0.5)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
            onMouseOver={e => {
              e.currentTarget.style.color = '#ff3c3c';
              e.currentTarget.style.textDecorationColor = '#ff3c3c';
              e.currentTarget.style.background = 'rgba(225, 6, 0, 0.1)';
              e.currentTarget.style.textShadow = '0 1px 4px rgba(225, 6, 0, 0.3)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = '#e10600';
              e.currentTarget.style.textDecorationColor = 'rgba(225, 6, 0, 0.5)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            want to see how this was made? →
          </a>
        </div>
      </div>
      )}
    </div>
  );
}
