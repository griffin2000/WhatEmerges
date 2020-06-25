#include "IsoSurface.hpp"
#include "Volume.hpp"
#include "include/dualmc.h"


bool IsoSurface::build(const Volume16*vol, uint16_t iso) {

    dualmc::DualMC<uint16_t> builder;

    
    std::vector<dualmc::Vertex> vertices;
    std::vector<dualmc::Quad> quads;

    builder.build(
        vol->getDataPointer(), 
        vol->getWidth(), 
        vol->getHeight(), 
        vol->getDepth(), 
        iso, true, false, vertices, quads);


    mIndices.clear();
    mPosition.clear();
    mNormal.clear();

    mIndices.resize(quads.size()*6);
    mNormal.resize(vertices.size());
    std::vector<float> nv(vertices.size());
    
    for(size_t i=0;i<quads.size();i++) {

       mIndices[i*6+0] = quads[i].i0;
       mIndices[i*6+1] = quads[i].i1;
       mIndices[i*6+2] = quads[i].i3;
       mIndices[i*6+3] = quads[i].i1;
       mIndices[i*6+4] = quads[i].i2;
       mIndices[i*6+5] = quads[i].i3;

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

       for(int j=0;j<6;j++) {
           
            int vi=mIndices[i*6+j];
            if(j<3)
                mNormal[vi] += n0;
            else
                mNormal[vi] += n1;
            nv[vi] +=1.0f;
       }

  

    }


    for(size_t i=0;i< nv.size();i++) {
        mNormal[i]/=nv[i];
        mNormal[i] = normalize(mNormal[i]);
    }

    float3 * vd = (float3*)&vertices[0];
    int vn= vertices.size();
    
    mPosition = std::vector<float3>(vd, vd+vn);

    return vn>0;

}