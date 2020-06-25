#include "IsoSurface.hpp"
#include "Volume.hpp"
#include "third-party/dualmc.h"


bool IsoSurface::build(const Volume16*vol, uint16_t iso) {

    dualmc::DualMC<uint16_t> builder;
    
    std::vector<dualmc::Vertex> vertices;
    std::vector<dualmc::Quad> quads;

    //Build the iso-surface using Dual Marching Cubes algorithm
    builder.build(
        vol->getDataPointer(), 
        vol->getWidth(), 
        vol->getHeight(), 
        vol->getDepth(), 
        iso, 
        true, //Create manifold
        false,//Don't create triange soup (create connected mesh)
        vertices, 
        quads);



    //Clear any existing data
    mIndices.clear();
    mPosition.clear();
    mNormal.clear();

    //Set the indices and vertex vector
    mIndices.resize(quads.size()*6);
    mNormal.resize(vertices.size());
    std::vector<float> nv(vertices.size());
    

    for(size_t i=0;i<quads.size();i++) {
       //Dual MC produces quads, convert to triangless
       mIndices[i*6+0] = quads[i].i0;
       mIndices[i*6+1] = quads[i].i1;
       mIndices[i*6+2] = quads[i].i3;//Indices are flipped
       mIndices[i*6+3] = quads[i].i1;
       mIndices[i*6+4] = quads[i].i2;
       mIndices[i*6+5] = quads[i].i3;

       //Compute normals for all adjacent faces
       float3 qv[6];
       for(int j=0;j<6;j++) {
           int vi=mIndices[i*6+j];
           qv[j] = *(float3*)&vertices[vi];
       }
       float3 e0,e1,e2,e3;
       e0 = normalize(qv[1]-qv[0]);
       e1 = normalize(qv[2]-qv[1]);
       e2 = normalize(qv[4]-qv[3]);
       e3 = normalize(qv[5]-qv[4]);
       float3 n0,n1;
       n0=cross(e0,e1);
       n1=cross(e2,e3);

       //Sum the normals
       for(int j=0;j<6;j++) {
           
            int vi=mIndices[i*6+j];
            if(j<3)
                mNormal[vi] += n0;
            else
                mNormal[vi] += n1;
            nv[vi] +=1.0f;
       }

  

    }

    //Normalize the normals
    for(size_t i=0;i< nv.size();i++) {
        mNormal[i]/=nv[i];
        mNormal[i] = normalize(mNormal[i]);
    }

    //Copy the position data
    float3 * vd = (float3*)&vertices[0];
    size_t vn= vertices.size();
    
    mPosition = std::vector<float3>(vd, vd+vn);

    return vn>0;

}