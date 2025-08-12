import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter,
  Users,
  Building2,
  Mail,
  Star
} from 'lucide-react';

interface ContactData {
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
  location?: string;
  industry?: string;
  website?: string;
  linkedin?: string;
  score?: number;
  emailSent?: boolean;
  [key: string]: any;
}

interface ContactCanvasProps {
  contacts: ContactData[];
  className?: string;
  width?: number;
  height?: number;
}

interface ContactNode {
  id: string;
  contact: ContactData;
  x: number;
  y: number;
  radius: number;
  color: string;
  connections: string[];
}

export function ContactCanvas({ contacts, className = "", width = 800, height = 600 }: ContactCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<ContactNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<ContactNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ContactNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [groupBy, setGroupBy] = useState<'company' | 'industry' | 'score' | 'status'>('company');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Color schemes for different groupings
  const getNodeColor = (contact: ContactData, groupBy: string): string => {
    switch (groupBy) {
      case 'company':
        return contact.company ? getCompanyColor(contact.company) : '#64748b';
      case 'industry':
        return contact.industry ? getIndustryColor(contact.industry) : '#64748b';
      case 'score':
        return getScoreColor(contact.score || 0);
      case 'status':
        return contact.emailSent ? '#10b981' : '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  const getCompanyColor = (company: string): string => {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#f97316'];
    const hash = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getIndustryColor = (industry: string): string => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const hash = industry.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Initialize nodes with force-directed layout
  useEffect(() => {
    if (contacts.length === 0) return;

    const newNodes: ContactNode[] = contacts.map((contact, index) => {
      const angle = (index / contacts.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      const centerX = width / 2;
      const centerY = height / 2;
      
      return {
        id: `contact-${index}`,
        contact,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: Math.max(15, Math.min(30, (contact.score || 50) / 3)),
        color: getNodeColor(contact, groupBy),
        connections: []
      };
    });

    // Add connections based on shared companies or industries
    newNodes.forEach((node, i) => {
      newNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const isSameCompany = node.contact.company && 
                                node.contact.company === otherNode.contact.company;
          const isSameIndustry = node.contact.industry && 
                                 node.contact.industry === otherNode.contact.industry;
          
          if (isSameCompany || (isSameIndustry && Math.random() > 0.7)) {
            node.connections.push(otherNode.id);
          }
        }
      });
    });

    setNodes(newNodes);
  }, [contacts, groupBy, width, height]);

  // Force-directed layout simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const centerX = width / 2;
        const centerY = height / 2;

        // Apply forces
        newNodes.forEach((node, i) => {
          let fx = 0, fy = 0;

          // Repulsion from other nodes
          newNodes.forEach((otherNode, j) => {
            if (i !== j) {
              const dx = node.x - otherNode.x;
              const dy = node.y - otherNode.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0) {
                const force = (node.radius + otherNode.radius + 20) / distance;
                fx += (dx / distance) * force * 0.1;
                fy += (dy / distance) * force * 0.1;
              }
            }
          });

          // Attraction to center
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          fx += dx * 0.001;
          fy += dy * 0.001;

          // Connection forces
          node.connections.forEach(connectionId => {
            const connectedNode = newNodes.find(n => n.id === connectionId);
            if (connectedNode) {
              const dx = connectedNode.x - node.x;
              const dy = connectedNode.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const idealDistance = 100;
              if (distance > 0) {
                const force = (distance - idealDistance) / distance * 0.02;
                fx += dx * force;
                fy += dy * force;
              }
            }
          });

          // Apply forces with damping
          node.x += fx * 0.5;
          node.y += fy * 0.5;

          // Keep nodes within bounds
          node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
          node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
        });

        return newNodes;
      });
    };

    const interval = setInterval(simulate, 50);
    const timeout = setTimeout(() => clearInterval(interval), 3000); // Stop after 3 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [nodes.length, width, height]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply zoom and offset
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(offsetX, offsetY);

    // Draw connections
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';

      // Node border
      ctx.strokeStyle = hoveredNode?.id === node.id ? '#000' : '#fff';
      ctx.lineWidth = hoveredNode?.id === node.id ? 3 : 2;
      ctx.stroke();

      // Score badge for high-scoring contacts
      if (node.contact.score && node.contact.score >= 70) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(node.x + node.radius * 0.7, node.y - node.radius * 0.7, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', node.x + node.radius * 0.7, node.y - node.radius * 0.7 + 3);
      }

      // Contact initials
      if (node.contact.name) {
        const initials = node.contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, node.radius / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(initials, node.x, node.y + 4);
      }
    });

    ctx.restore();
  }, [nodes, hoveredNode, zoomLevel, offsetX, offsetY, width, height]);

  // Mouse event handlers
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offsetX) / zoomLevel;
    const y = (event.clientY - rect.top - offsetY) / zoomLevel;

    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      setOffsetX(prev => prev + deltaX);
      setOffsetY(prev => prev + deltaY);
      setDragStart({ x: event.clientX, y: event.clientY });
      return;
    }

    const hoveredNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    setHoveredNode(hoveredNode || null);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offsetX) / zoomLevel;
    const y = (event.clientY - rect.top - offsetY) / zoomLevel;

    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  const handleReset = () => {
    setZoomLevel(1);
    setOffsetX(0);
    setOffsetY(0);
    setSelectedNode(null);
  };

  const getGroupStats = () => {
    const stats: Record<string, number> = {};
    
    contacts.forEach(contact => {
      let key = '';
      switch (groupBy) {
        case 'company':
          key = contact.company || 'Unknown';
          break;
        case 'industry':
          key = contact.industry || 'Unknown';
          break;
        case 'score':
          if ((contact.score || 0) >= 80) key = 'High (80+)';
          else if ((contact.score || 0) >= 60) key = 'Medium (60-79)';
          else if ((contact.score || 0) >= 40) key = 'Low (40-59)';
          else key = 'Very Low (<40)';
          break;
        case 'status':
          key = contact.emailSent ? 'Contacted' : 'New';
          break;
      }
      stats[key] = (stats[key] || 0) + 1;
    });

    return Object.entries(stats).map(([key, count]) => ({ key, count }));
  };

  if (contacts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No contacts to visualize
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Upload or search for contacts to see the network visualization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Contact Network ({contacts.length} contacts)
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Group by Company</SelectItem>
                  <SelectItem value="industry">Group by Industry</SelectItem>
                  <SelectItem value="score">Group by Score</SelectItem>
                  <SelectItem value="status">Group by Status</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={handleZoomIn} data-testid="button-zoom-in">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} data-testid="button-zoom-out">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} data-testid="button-reset">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex">
            {/* Canvas */}
            <div className="flex-1">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="border cursor-move"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                data-testid="contact-canvas"
              />
            </div>

            {/* Sidebar with details */}
            <div className="w-80 border-l bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
              {/* Group Statistics */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Distribution
                </h4>
                <div className="space-y-2">
                  {getGroupStats().map(({ key, count }) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 truncate">{key}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected/Hovered Contact Details */}
              {(selectedNode || hoveredNode) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Contact Details
                  </h4>
                  {(() => {
                    const contact = (selectedNode || hoveredNode)!.contact;
                    return (
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {contact.name || 'Unknown Name'}
                          </h5>
                          {contact.title && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contact.title}</p>
                          )}
                        </div>

                        {contact.company && (
                          <div className="flex items-center text-sm">
                            <Building2 className="w-3 h-3 mr-2 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{contact.company}</span>
                          </div>
                        )}

                        {contact.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-2 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 truncate">{contact.email}</span>
                          </div>
                        )}

                        {contact.score && (
                          <div className="flex items-center text-sm">
                            <Star className="w-3 h-3 mr-2 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Score: {contact.score}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                          <Badge variant={contact.emailSent ? "default" : "secondary"}>
                            {contact.emailSent ? "Contacted" : "New"}
                          </Badge>
                          {contact.score && contact.score >= 80 && (
                            <Badge className="bg-yellow-500 text-white">High Value</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Legend */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">Contacted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">New Contact</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">★ High Score (70+)</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    • Click and drag to pan
                    • Click on nodes to select
                    • Use zoom controls
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}